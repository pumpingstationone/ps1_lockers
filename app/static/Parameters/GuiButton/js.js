var GuiButton = {
  getHTML: function (param) {
    return `{{ html }}`
  },
  init: function (param) {
    hermes.p[param.pid] = function (pid, val) {
      console.log(`button ${pid} clicked`);
    }
  }
}