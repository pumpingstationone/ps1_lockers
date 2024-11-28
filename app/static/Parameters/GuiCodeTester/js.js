var GuiCodeTester = {
  terminals: {},
  assets: {},
  getHTML: function (param) {
    return `{{ html }}`
  },

  send: function (pid) {
    const text = GuiCodeTester.assets[`${pid}_editor`].getValue();
    hermes.send(pid, text);
  },
  init: function (param) {
    // Initialize CodeMirror
    this.assets[`${param.pid}_editor`] = CodeMirror.fromTextArea(document.getElementById(`${param.pid}_code`), {
      lineNumbers: true, // Display line numbers
      mode: "python", // Set mode to Python
      theme: "dracula" // Set theme (you can change it)
    });

    gid(`${param.pid}_description`).innerHTML = marked.parse(param.description)

    let editor = this.assets[`${param.pid}_editor`]

    // Set initial and maximum height
    let initialHeight = 50; // Initial height in pixels
    let maxHeight = 800; // Maximum height in pixels

    // Set initial height
    document.getElementById(`${param.pid}_editor`).style.height = initialHeight + 'px';

    // Make editor resizable
    editor.setSize(null, initialHeight);

    editor.setValue(param.code);

    // Get the resize bar element
    this.assets[`${param.pid}_resizeBar`] = document.getElementById(`${param.pid}_resize-bar`);

    // Function to handle mouse down on the resize bar
    this.assets[`${param.pid}_resizeBar`].addEventListener('mousedown', function (event) {
      event.preventDefault(); // Prevent text selection
      var startY = event.clientY;
      var startHeight = editor.getWrapperElement().clientHeight;

      // Function to handle mouse move while dragging
      function onMouseMove(event) {
        var delta = event.clientY - startY;
        var newHeight = startHeight + delta;
        newHeight = Math.min(Math.max(newHeight, initialHeight), maxHeight);
        document.getElementById(`${param.pid}_editor`).style.height = newHeight + 'px';
        editor.setSize(null, newHeight);
      }

      // Function to handle mouse up after dragging
      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });


    hermes.p[param.pid] = function (pid, data) {
      const cmd = JSON.parse(data);
      console.log(cmd);
      if (cmd.cmd === 'term') {
        Terminal.write(gid(`${pid}_terminal`), cmd.msg)
      }
    }
    const terminal = Terminal.init(param, true)
    this.terminals[param.pid] = terminal;  // initialize the terminal
    gid(`${param.pid}_toggler`).click();
  },
  button: function(button) {
    // console.log(button.innerText);
    const pid = button.dataset.pid
    const msg = `{"cmd": "button", "msg": "${button.innerText}"}`;
    hermes.send(pid, msg);
  },
  make_buttons: function(param) {
    let buttons_html = ""
    for (button in param.buttons) {
      const but = `<button data-pid=${param.pid} onclick="GuiCodeTester.button(this)">${button}</button>`;
      buttons_html = buttons_html + but;
    }
    return buttons_html
  }
  
}