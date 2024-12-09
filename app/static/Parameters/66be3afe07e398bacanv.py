# --------------------------------------
name = 'ps1_lockers'
canvas_id = '66be3afe07e398bacanv'
# __version__ = TODO: add this
# --------------------------------------
from floe import FP

from GuiLockerPicker import GuiLockerPicker
def setup(iris):

  GuiLockerPicker(name='neverland__pallet_racks', pid=11858, heartbeat=True, heartbeat_interval=1000, websocket='http://10.10.2.26/ws', pod=False, id_check=None, datatype="int", debug=False, active=True, bcast=False, iris=iris)
  iris.add_hots({})
  iris.set_info(canvas_id, name)