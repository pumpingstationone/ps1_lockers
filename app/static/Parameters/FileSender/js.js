var FileSender = {
  getHTML: function (param) {
    return `{{ html }}`
  },
  init: function (param) {
    hermes.p[param.pid] = function (pid, data) {
      gid(`${pid}_file`).value = data;
    }
  }
}