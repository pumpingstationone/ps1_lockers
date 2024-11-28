var GuiSlider = {
  getHTML: function (param) {
    return `{{ html }}`
  },
  init: function (param) {
    hermes.p[param.pid] = function (pid, val) {
      var slider = document.getElementById(pid);
      if (slider.value != val) {
        slider.value = val;
        // console.log('slider  ' + slider.value)
      }
    }
  }
}