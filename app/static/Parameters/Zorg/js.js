var Zorg = {
  callback: function (pid, _data) {
    let data = JSON.parse(_data);
    // test function for random posts
    if (data.cmd == "board_data") {
      gid(`${pid}_this_data`).innerHTML = data.board_data;
    }
  },
  init: function (param) {
    const zorg_pid = param.pid;
    hermes.p[65501] = function (pid, data) {  // zorg has file sender at this address
      if (data == 100) {
        gid('65501_file_progress').value = 0;
        Zorg.post(zorg_pid, "file send finished");
        return
      }
      gid('65501_file_progress').value = data;
    }
    hermes.p[param.pid] = function (pid, data) {
      console.log(data)
      data = JSON.parse(data);
      if (data.cmd == 'term') {
        Zorg.post(pid, data.msg);
      }
      else if (data.cmd == 'devices') {
        Zorg.create_device_table(pid, data.devices)
      }
      else if (data.cmd == 'cluster') {
        Zorg.create_cluster_list(pid, data.cluster)
      }
      else if (data.cmd == 'files') {
        Zorg.create_file_table(pid, data.files.sort())
      }
      else if (data.cmd == 'my_id') {
        console.log(data)
        cmd = { cmd: 'get_id', id: data.my_id };
        send_cmd(pid, cmd, Zorg.callback)
      }
    }
  },
  call: function (_pid, cmd, other) {
    let type;
    let msg;
    let load;
    if (cmd == 'send') {
      if (gid(`${_pid}_radio_string`).checked) {
        type = 'string';
        msg = gid(`${_pid}_string`).value;
      }
      else {
        type = 'bytes';
        msg = [
          gid(`${_pid}_bytes_0`).value,
          gid(`${_pid}_bytes_1`).value,
          gid(`${_pid}_bytes_2`).value,
          gid(`${_pid}_bytes_3`).value,
          gid(`${_pid}_bytes_4`).value,
          gid(`${_pid}_bytes_5`).value,
          gid(`${_pid}_bytes_6`).value,
          gid(`${_pid}_bytes_7`).value,
        ]
      }
      load = {
        cmd: cmd,
        adr: gid(`${_pid}_adr`).value,
        pid: gid(`${_pid}_pid`).value,
        type: type,
        msg: msg,
        write: gid(`${_pid}_read`).checked
      }
    }
    else if (cmd == 'create_sub') {
      load = {
        cmd: cmd,
        sender: {
          adr: gid(`${_pid}_sub_s_adr`).value,
          pid: gid(`${_pid}_sub_s_pid`).value,
        },
        recvr: {
          adr: gid(`${_pid}_sub_adr`).value,
          pid: gid(`${_pid}_sub_pid`).value,
        },
        struct: gid(`${_pid}_struct`).value,
      }
    }
    else if (cmd == 'ide_subs') {
      load = {
        cmd: cmd,
        subs: gid(`${_pid}_ide_subs`).value,
      }
    }
    else if (cmd == 'save_subs') {
      load = {
        cmd: cmd
      }
    }
    else if (cmd == 'clear_subs') {
      load = {
        cmd: cmd
      }
    }
    else if (cmd == 'reset_self') {
      load = {
        cmd: cmd
      }
    }
    else if (cmd == 'ping') {
      load = { cmd: cmd }
      gid(`${_pid}_device_table`).innerHTML = "pinging<br>please wait";
    }
    else if (cmd == 'show_files') {
      load = { cmd: cmd }
      gid(`${_pid}_files`).innerHTML = "fetching files<br>please wait";
    }
    else if (cmd == 'reset') {
      load = { cmd: cmd }
      gid(`${_pid}_files`).innerHTML = "fetching files<br>please wait";
    }
    else if (cmd == 'lightshow') {
      load = { cmd: cmd }
      gid(`${_pid}_files`).innerHTML = "fetching files<br>please wait";
    }
    else if (cmd == 'send_file') {
      load = other
    }
    else if (cmd == 'cluster') {
      load = {
        cmd: cmd
      }
    }
    else if (cmd == 'get_file') {
      load = {
        cmd: cmd,
        filename: other
      }
    }
    else if (cmd == 'test') {
      load = {
        cmd: cmd,
      }
    }
    console.log(load);
    hermes.send_json(_pid, load)
  },
  getHTML: function (param) {
    return `{{ html }}`
  },
  craft_file_message: function (pid, button, filename) {
    let adr = parseInt(button.nextElementSibling.value)
    if (isNaN(adr)) {
      this.post(pid, 'enter valid address')
      return
    }
    let load = {
      cmd: 'send_file',
      adr: adr,
      filename: filename,
    }
    this.call(pid, 'send_file', load)
  },
  post: function (pid, line) {
    let subs = gid(`${pid}_term`);
    subs.innerHTML = subs.innerHTML + '<br>' + line.replaceAll('\n', '<br>')
  },
  create_cluster_list: function (pid, cluster) {
    div = gid(`${pid}_cluster`);
    html = "Cluster Info<br>";
    for (const clust of cluster) {
      html = html + `${clust[0]}: ${clust[1]}<br>`
    }
    html = html + "---------<br><br><br>";
    div.innerHTML = html;
  },
  create_device_table: function (pid, devices) {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    // create headings
    const row = document.createElement('tr');
    const adr = document.createElement('td');
    adr.textContent = "adr";

    const dev_id = document.createElement('td');
    dev_id.textContent = "device id";

    const name = document.createElement('td');
    name.textContent = "name";

    row.appendChild(adr);
    row.appendChild(dev_id);
    row.appendChild(name);
    tbody.appendChild(row);

    for (const [adr, device] of Object.entries(devices)) {
      const row = document.createElement('tr');
      const adrCell = document.createElement('td');
      adrCell.textContent = adr;
      row.appendChild(adrCell);

      const device_id = document.createElement('td');
      device_id.textContent = device[0];
      row.appendChild(device_id);

      const name = document.createElement('td');
      if (device[1] == 'unknown device') {
        name.innerHTML = '<button>feature coming soon</button>';
      }
      else {
        name.innerHTML = "<button>mate</button>";
      }
      name.id = `${device[0]}_name`
      row.appendChild(name);
      // Append the row to the table body
      tbody.appendChild(row);
    }
    // Append the table body to the table
    table.appendChild(tbody);

    // Get the table_div element
    const tableDiv = document.getElementById(`${pid}_device_table`);
    tableDiv.innerHTML = '';
    // Append the table to the table_div element
    tableDiv.appendChild(table);
  },
  create_file_table: function (pid, files) {
    file_div = gid(`${pid}_files`)
    file_div.innerHTML = ""

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    // create headings
    const row = document.createElement('tr');
    const _filename = document.createElement('td');
    _filename.textContent = "filename";

    const actions = document.createElement('td');
    actions.textContent = "actions";

    row.appendChild(_filename);
    row.appendChild(actions);
    tbody.appendChild(row);

    for (const filename of files) {
      const row = document.createElement('tr');
      const name = document.createElement('td');
      name.textContent = filename;
      row.appendChild(name);
      const act = document.createElement('td');
      if (filename.charCodeAt(0) >= 65 && filename.charCodeAt(0) <= 90) {
        act.innerHTML = `
        <button onclick="Zorg.craft_file_message(${pid}, this, '${filename}')">send to</button>
        <input style="width: 100px;" type="number">
        <button class="xsm_button blue" onclick="Zorg.call(${pid}, 'get_file', '${filename}')">update</button>
        `
      }
      else {
        act.innerHTML = `
      <button onclick="Zorg.craft_file_message(${pid}, this, '${filename}')">send to</button>
      <input style="width: 100px;" type="number">
      `
      }

      row.appendChild(act);
      tbody.appendChild(row);
    }
    // Append the table body to the table
    table.appendChild(tbody);
    file_div.appendChild(table);
  },
  tabs: function (event, pid, tab_name) {
    // handle tabs
    let buttons = document.getElementById(`${pid}_tabs`).children;
    for (var i = 0; i < buttons.length; i++) {
      let button = buttons[i];
      if (button.classList.contains('green')) {
        console.log(button)
        button.classList.remove('green');
        button.classList.add('grey');
      }
    }
    event.target.classList.remove('grey');
    event.target.classList.add('green');

    msg_sender = gid(`${pid}_msg_sender`);
    push_subs = gid(`${pid}_push_subs`);
    single_sub = gid(`${pid}_single_sub`);
    devices = gid(`${pid}_devices`);
    esp32 = gid(`${pid}_esp32`);

    msg_sender.style.display = "none";
    push_subs.style.display = "none";
    single_sub.style.display = "none";
    devices.style.display = "none";
    esp32.style.display = "none";

    if (tab_name == 'msg_sender') { msg_sender.style.display = "block"; }
    else if (tab_name == 'push_subs') { push_subs.style.display = "block"; }
    else if (tab_name == 'single_sub') { single_sub.style.display = "block"; }
    else if (tab_name == 'devices') { devices.style.display = "block"; }
    else if (tab_name == 'esp32') { esp32.style.display = "block"; }
  }
}