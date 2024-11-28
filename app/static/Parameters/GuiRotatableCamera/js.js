var GuiRotatableCamera = {
  getHTML: function (param) {
    return `{{ html }}`
  },
  rotate_cam: function (pid, slider) {
    // hermes.send(pid, slider.value)
    document.getElementById(`${pid}_deg`).innerText = slider.value;
    document.getElementById(`${pid}`).style.transform = `rotate(${slider.value}deg)`;
  },
  reload_cam: function () {
    console.log('reloading cam');
    document.getElementById(`${pid}`).src = "http://10.203.136.47/video";
  },
  show_crosshair: function (pid, show) {
    document.getElementById(`${pid}_crosshair`).style.visibility = show;
  },
  init: function (param) {
    hermes.p[param.pid] = function (pid, data) {
      console.log('guicamera not impemented', data)
    }
  }
}