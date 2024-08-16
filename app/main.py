
from fastapi import Depends, FastAPI, Request, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel
from fastapi_mqtt import FastMQTT, MQTTConfig
from contextlib import asynccontextmanager

import locker_helper as lh

import os, json

lockers = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup code
    lh.get_all_lockers()
    yield
    print('doin it and doin it and doin it well')
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
# ----
#  MQTT
# ----
print('port', os.getenv("MQTT_PORT"))
mqtt_config = MQTTConfig(
    host=os.getenv("MQTT_HOST"),
    port=int(os.getenv("MQTT_PORT")),
    username=os.getenv("MQTT_USERNAME"),
)
mqtt = FastMQTT(config=mqtt_config)
# mqtt.init_app(app)

@mqtt.on_connect()
def mqtt_connect(client, flags, rc, properties):
    mqtt.client.subscribe("#")  # subscribing mqtt topic
    print("Connected: ", client, flags, rc, properties)


@mqtt.on_message()
async def message(client, topic, payload, qos, properties):
    data = payload.decode("utf-8")
    print("Received message: ", topic, data, qos, properties)
    return 0


@mqtt.subscribe("my/mqtt/topic/#")
async def message_to_topic(client, topic, payload, qos, properties):
    print("Received message to specific topic: ", topic, payload.decode(), qos, properties)
    return 0


@mqtt.on_disconnect()
def disconnect(client, packet, exc=None):
    print("Disconnected")


@mqtt.on_subscribe()
def subscribe(client, mid, qos, properties):
    print("subscribed", client, mid, qos, properties)


class FormModel(BaseModel):
    tag: str

templates = Jinja2Templates(directory='htmldirectory')
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

@app.get('/', response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})

@app.post('/get_tag', response_class=JSONResponse)
async def f_model(request: Request, form_model: FormModel):
    print('form_model', form_model)
    return {"data will go here": form_model}

@app.get('/pod', response_class=JSONResponse)
async def get_pod(request: Request, pod: str=""):
    pod = pod.replace('-', '/')
    print(pod)
    return lh.lockers[pod]


def process(cmd):
    cmd = json.loads(cmd)
    command = cmd['cmd']
    if command == 'get':
        # {cmd: get, pod:[pod_name]}
        return {
            'cmd': 'renderTable',
            'name': cmd['name'],
            'pod': lh.lockers[cmd['name']]    
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
    lockers[locker_pod] = websocket
    await websocket.send_json({'cmd': 'connected', 'name': locker_pod})
    try:
        while True:
            msg = await websocket.receive_text()
            resp = process(msg)
            print(lockers)
            await websocket.send_json(resp)

    except WebSocketDisconnect:
        print(f'closing connection, stopping {locker_pod}')

