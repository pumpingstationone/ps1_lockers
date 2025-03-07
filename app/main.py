
from fastapi import Depends, FastAPI, Request, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel
from fastapi_mqtt import FastMQTT, MQTTConfig
from contextlib import asynccontextmanager
import asyncio
import locker_helper as lh
import ldap
import os, json


open_sockets = {}

# ----
#  MQTT
# ----
print('MQTT_HOST', os.getenv("MQTT_HOST"))
print('MQTT_PORT', os.getenv("MQTT_PORT"))
MQTT_HOST = os.getenv("MQTT_HOST")
mqtt_config = MQTTConfig(
    host=MQTT_HOST,
    port=int(os.getenv("MQTT_PORT")),
    username=os.getenv("MQTT_USERNAME"),
)
mqtt = FastMQTT(config=mqtt_config)

async def heartbeat():
    while True:
        lh.package_lights(lh.lockers['neverland__pallet_racks'])
        await asyncio.sleep(10)
        
async def publish_to_sockets(socket_name, payload: dict):
    if socket_name in open_sockets:
        await open_sockets[socket_name].send_json(payload)

async def process_mqtt(topic, payload):
    device, locker_pod = topic.split('/')
    print(locker_pod)
    if device == 'ps1_lockers':        
        if locker_pod in open_sockets:
            print("found rfid for pod")
    
            await publish_to_sockets(locker_pod, {'cmd': 'choose_locker', 'user': payload,}) 
            print('sent')
    elif device == 'rfid': 
        tag_info = ldap.get_info_for_tag(payload)
        name = tag_info['name']
        await publish_to_sockets(locker_pod, {'cmd': 'choose_locker', 'user': name}) 

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup code
    lh.get_all_lockers()
    if MQTT_HOST:
        await mqtt.mqtt_startup()
    loop = asyncio.get_running_loop()
    loop.create_task(heartbeat())
    yield
    if MQTT_HOST:
        await mqtt.mqtt_shutdown()
    yield
    # shutdown code
        
# ---
# APP
# --- 
app = FastAPI(lifespan=lifespan)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if MQTT_HOST:
    print('inittting mq')
    mqtt.init_app(app)

@mqtt.on_connect()
def mqtt_connect(client, flags, rc, properties):
    mqtt.client.subscribe("ps1_lockers/neverland__pallet_racks")  # subscribing mqtt topic
    print("Connected: ", client, flags, rc, properties)

@mqtt.on_message()
async def message(client, topic, payload, qos, properties):
    data = payload.decode("utf-8")
    print("Received message: ", topic, data, qos, properties)
    await process_mqtt(topic=topic, payload=data)
    return 0


@mqtt.on_disconnect()
def disconnect(client, packet, exc=None):
    print("Disconnected")


@mqtt.on_subscribe()
def subscribe(client, mid, qos, properties):
    print("subscribed", client, mid, qos, properties)


class Tag(BaseModel):
    tag: str

templates = Jinja2Templates(directory='htmldirectory')
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

@app.get('/', response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})

@app.get('/topology', response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse('topos.html', {'request': request})

@app.get('/lockers', response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse('lockers.html', {'request': request})

@app.get('/list_lockers', response_class=JSONResponse)
async def list_lockers(request: Request):
    return lh.lockers


@app.post('/get_tag', response_class=JSONResponse)
async def f_model(request: Request, form_model: Tag):
    tag = form_model.tag
    tag = tag.zfill(10)
    tag_info = ldap.get_info_for_tag(tag)
    return tag_info

@app.post('/fake_mqtt', response_class=JSONResponse)
async def fake_mqtt(request: Request, form_model: Tag):
    tag = form_model.tag 
    tag = tag.zfill(10)   
    tag_info = ldap.get_info_for_tag(tag)
    if "Tag not found" in tag_info:
        return tag_info
    mqtt.publish("ps1_lockers/neverland__pallet_racks", [tag_info['name'], tag_info['cn']])
    return tag_info


@app.get('/pod', response_class=JSONResponse)
async def get_pod(request: Request, pod: str=""):
    pod = pod.replace('-', '/')
    print(pod)
    return lh.lockers[pod]

@app.get('/pod_admin/{pod}', response_class=HTMLResponse)
async def pod_admin(request: Request, pod: str=""):
    
    print(pod)
    return templates.TemplateResponse('pod_admin.html', {'request': request, 'pod': pod, 'lockers': lh.lockers[pod]})


def order_processor(order, boot=False):
    data = order['data']
    
    if order['cmd'] == 'update_locker':
        lh.update_locker(data)
    
    if boot:
        return 
    
    with open(f'lockers/{data["pod"]}.txt', 'a') as f:
        json.dump(order, f)
        f.write('\n')
        
    return {"cmd": "populate_table", "data":lh.lockers[data['pod']]}

@app.post('/orders', response_class=JSONResponse)
async def order_taker(request: Request, order: dict):
    print(order)
    resp = order_processor(order)
        
    return resp

def process(cmd):
    cmd = json.loads(cmd)
    command = cmd['cmd']
    if command == 'get':
        # {cmd: get, pod:[pod_name]}
        return {
            'cmd': 'render_table',
            'name': cmd['name'],
            'pod': lh.lockers[cmd['name']]    
        }
    elif command == 'claim':
        # {cmd: 'claim', name: user, address: address, pod: pod}
        lh.claim_locker(cmd['pod'], cmd['name'], cmd['address'])
        return {
            'cmd': 'render_table', # just rerender the whole thing because lazy
            'name': cmd['pod'],
            'pod': lh.lockers[cmd['pod']]    
        }


@app.websocket("/ws")
async def websocket_endpoint(
        websocket: WebSocket,
        locker_pod: str,
        q=None,
        canvas_id: str=None,
):
    print(locker_pod)
    await websocket.accept()        
    open_sockets[locker_pod] = websocket
    await websocket.send_json({'cmd': 'connected', 'name': locker_pod})
    try:
        while True:
            msg = await websocket.receive_text()
            resp = process(msg)
            print(open_sockets)
            if resp is not None:
                await websocket.send_json(resp)

    except WebSocketDisconnect:
        print(f'{open_sockets = }')
        print(f'closing connection, stopping {locker_pod}')
        open_sockets.pop(locker_pod)


### boot up and process lockers
print('booting')
for pod in os.listdir('lockers'):
    with open(f"lockers/{pod}", 'r') as f:
        for order in f:
            order_processor(json.loads(order), boot=True)

