var GuiCmdAggregator = {
  assets: {},
  getHTML: function (param) {
    return `{{ html }}`
  },
  init: function (param) {

    // Initialize CodeMirror
    this.assets[`${param.pid}_editor`] = CodeMirror.fromTextArea(document.getElementById(`${param.pid}_code`), {
      lineNumbers: true, // Display line numbers
      mode: "python", // Set mode to Python
      theme: "dracula" // Set theme (you can change it)
    });

    let editor = this.assets[`${param.pid}_editor`]

    // Set initial and maximum height
    let initialHeight = 100; // Initial height in pixels
    let maxHeight = 800; // Maximum height in pixels

    // Set initial height
    document.getElementById(`${param.pid}_editor`).style.height = initialHeight + 'px';

    // Make editor resizable
    editor.setSize(null, initialHeight);

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
      editor.setValue(data)
    }
  },
  send: function (pid) {
    let list = this.verify(pid, false);
    if (list !== null) {
      // console.log(list);
      hermes.send(pid, list)
    }

  },
  verify: function (pid, json) {
    let editor = this.assets[`${pid}_editor`];
    // console.log(editor)
    let raw = editor.getValue().split('\n')
    for (e in raw) {
      try {
        // console.log(raw[e], raw[e] == "")
        if (raw[e] == "") {
          continue
        }
        JSON.parse(raw[e])
      }
      catch {

        document.getElementById(`${pid}_editor_error`).innerHTML = `error on line ${parseInt(e) + 1} - no action was taken`
        return null
      }
    }
    document.getElementById(`${pid}_editor_error`).innerHTML = ""
    if (json == true) {
      return list = `[${raw}]`;
    }
    return editor.getValue()
  },
  copy2clip: function (pid) {
    let clip = this.verify(pid, true)
    if (clip != null) {
      navigator.clipboard.writeText(clip);
    }
  }
}
