var Gui3dViewer = {
  assets: {},
  getHTML: function (param) {
    return `{{ html }}`
  },

  send: function (pid) {

    const text = Gui3dViewer.assets[`${pid}_editor`].getValue();
    hermes.send(pid, text);
  },
  init: function (param) {
    hermes.p[param.pid] = function (pid, data) {
      Gui3dViewer.assets[`${pid}_editor`].setValue(data);
      Gui3dViewer.recalculate(pid);
    }

    // Initialize CodeMirror
    this.assets[`${param.pid}_editor`] = CodeMirror.fromTextArea(document.getElementById(`${param.pid}_code`), {
      lineNumbers: true, // Display line numbers
      mode: "python", // Set mode to Python
      theme: "dracula" // Set theme (you can change it)
    });

    let editor = this.assets[`${param.pid}_editor`]
    if (editor.getValue() == 'null') {
      editor.setValue('');
    }

    // Set initial and maximum height
    let initialHeight = 50; // Initial height in pixels
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


    this.recalculate(param.pid);

    document.getElementById(`${param.pid}_file_input`).addEventListener('change', function (event) {
      const fileInput = event.target;

      if (fileInput.files.length > 0) {
        const selectedFile = fileInput.files[0];
        // Read the file content
        const reader = new FileReader();
        reader.onload = function (e) {
          const fileContent = e.target.result;
          Gui3dViewer.assets[`${param.pid}_editor`].setValue(fileContent);
        };
        reader.readAsText(selectedFile);
      }
    });
    document.getElementById(`${param.pid}_color`).addEventListener('change', function (event) {
      const pid = event.target.id.split('_')[0];
      console.log(event.target, gid(`${pid}_color`).value);
      Gui3dViewer.recalculate(pid)
    });
  },
  save_file: function (pid) {
    console.log(this.assets)
    // Prompt for a filename
    const fileName = prompt('Enter a filename: ', "filename.evzr");

    if (fileName) {
      const fileContent = this.assets[`${pid}_editor`].getValue();

      const blob = new Blob([fileContent], { type: 'text/plain' });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;

      a.download = fileName;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(blobUrl);
    }
  },
  recalculate: function (pid) {
    DDD_viewer.recalculate_toolpath(
      pid,
      Gui3dViewer.assets[`${pid}_editor`].getValue(),
      gid(`${pid}_color`).value
    );
  },
}