
from fastapi import Depends, FastAPI, Request, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.responses import RedirectResponse
from pydantic import BaseModel
from fastapi_mqtt import FastMQTT, MQTTConfig
from contextlib import asynccontextmanager

import locker_helper as lh

import os

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

next(lifespan)
templates = Jinja2Templates(directory='htmldirectory')
app.mount("/static", StaticFiles(directory="static", html=True), name="static")




@app.get('/', response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})

@app.post('/get_tag', response_class=JSONResponse)
async def f_model(request: Request, form_model: FormModel):
    print('form_model', form_model)
    return {"data will go here": form_model}


@app.websocket("/ws")
async def websocket_endpoint(
        websocket: WebSocket,
        locker_pod: str,
        q=None,
        canvas_id: str=None,
):
    print(locker_pod)
    await websocket.accept()        
    
    try:
        while True:
            msg = await websocket.receive_text()
            await websocket.send_text(f"message: {msg}")

    except WebSocketDisconnect:
        print(f'closing connection, stopping {locker_pod}')
        
