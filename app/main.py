
from fastapi import Depends, FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.responses import RedirectResponse
from pydantic import BaseModel
import os


class FormModel(BaseModel):
    tag: str

app = FastAPI()
templates = Jinja2Templates(directory='htmldirectory')
app.mount("/static", StaticFiles(directory="static", html=True), name="static")


@app.get('/', response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse('index.html', {'request': request, 'env_1': ENV_1, 'env_2': ENV_2})

@app.post('/get_tag', response_class=JSONResponse)
async def f_model(request: Request, form_model: FormModel):
    print('form_model', form_model)
    return {"data will go here": form_model}
