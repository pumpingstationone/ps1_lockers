var GuiCheckbox = {
  getHTML: function (param) {
    var checked = "";
    if (param.initial_value) {
      checked = "checked";
    }
    return `{{ html }}`
  },
  init: function (param) {
    hermes.p[param.pid] = function (pid, val) {
      let bool;
      // console.log(val)
      if (val == 'True') { bool = true; }
      else { bool = false; }

      document.getElementById(pid).checked = bool;
    }
  }
}