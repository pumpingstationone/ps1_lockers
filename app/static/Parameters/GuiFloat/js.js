var GuiFloat = {
  getHTML: function (param) {
    return `{{ html }}`
  },
  init: function (param) {
    hermes.p[param.pid] = function (pid, data) {
      gid(`${pid}`).value = data;
    }
  },
  send: function (pid) {
    const val = gid(pid).value
    hermes.send(pid, val)
  }
}