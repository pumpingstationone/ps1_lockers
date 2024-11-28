var GRBLScara = {
  assets: {},
  getHTML: function (param) {
    return `{{ html }}`
  },
  init: function (param) {
    this.assets[param.pid] = {}
    let self = this.assets[param.pid];
    self.theta_len = param.theta_len;
    self.phi_len = param.phi_len;
    self.theta_2 = self.theta_len ** 2;
    self.phi_2 = self.phi_len ** 2;

    hermes.p[param.pid] = function (pid, data) {  // register functions with hermes
      const msg = JSON.parse(data);
      if (msg.cmd == 'post') {
        Terminal.write(gid(`${pid}_terminal`), msg.data);
        let command = msg.data;
        if (command[0] === '$') {
          // we have a command frame
          if (command.includes('=')) {
            pieces = command.split('=')
            let table = document.getElementById('machine_table');
            for (const row of table.rows) {
              if (row.cells[0].innerHTML.includes(pieces[0])) {
                row.cells[1].querySelector('input').value = pieces[1]
              }
            }
          }
        }
      }
      else if (msg.cmd == 'status') {
        gid(`${pid}_xpos`).innerHTML = msg.x;
        gid(`${pid}_ypos`).innerHTML = msg.y;
        gid(`${pid}_zpos`).innerHTML = msg.z;
        gid(`${pid}_apos`).innerHTML = msg.a;
        gid(`${pid}_bpos`).innerHTML = msg.b;
        gid(`${pid}_cpos`).innerHTML = msg.c;
        gid(`${pid}_theta_enc`).innerHTML = msg.theta_enc;
        gid(`${pid}_phi_enc`).innerHTML = msg.phi_enc;
        gid(`${pid}_state`).innerHTML = `Status: ${msg.state}`;
        if (gid(`${pid}_blinker`).style.backgroundColor != "rgb(12, 19, 17)") {
          gid(`${pid}_blinker`).style.backgroundColor = "rgb(12, 19, 17)";
        }
        else { gid(`${pid}_blinker`).style.backgroundColor = "rgb(18, 48, 43)"; }
        if (gid(`${pid}_show_status`).checked == true) {
          Terminal.write(gid(`${pid}_terminal`), JSON.stringify(msg));
        }
        // const pos = GRBLScara.fk(param.pid, msg.x, msg.y);
        const pos = GRBLScara.fk(pid, msg.theta_enc, msg.phi_enc);
        gid(`${pid}_cart_x`).innerHTML = pos[0];
        gid(`${pid}_cart_y`).innerHTML = pos[1];
        gid(`${pid}_cart_z`).innerHTML = msg.z;

      }
      // else if (msg.cmd == 'set_offset') {
      //   gid(`${param.pid}_xoffset`).innerHTML = msg.x;
      //   gid(`${param.pid}_yoffset`).innerHTML = msg.y;
      //   gid(`${param.pid}_zoffset`).innerHTML = msg.z;
      //   gid(`${param.pid}_name`).innerHTML = `Name: ${msg.name}`;
      // }
      else if (msg.cmd == 'set_work_offset') {
        let table = gid(`${pid}_machine_table`);
        axes = ['x', 'y', 'z', 'a', 'b', 'c'];
        for (let i = 1; i < 7; i++) {
          table.rows[i].cells[3].innerHTML = msg.data[axes[i - 1]];
        }
        table.rows[7].cells[3].innerHTML = "Name: " + msg.data.name;
      }
    };
    Terminal.init(param, true);  // initialize the terminal
  },
  send: function (pid, cmd, payload) {
    if (cmd == 'req_w_offset') {
      // this function will send a request to main to get machine position 
      // and return another value to actually 
      let table = gid(`${pid}_work_offsets_table`)
      let name = table.rows[payload + 1].cells[1].querySelector('input').value
      let data = {
        cmd: 'req_w_offset',
        off_id: payload,
        name: name
      }
      hermes.send_json(pid, data);
    }

  },
  machine: function (pid, button, action) {
    // this is stuff that should be send directly to the grbl machine itself
    console.log(button)
    // hack for now
    command = button.parentElement.previousElementSibling.previousElementSibling.innerHTML

    let data = {
      cmd: 'machine',
      action: action,
      command: command,
    }
    if (action == 'set') {
      let value = parseFloat(button.parentElement.previousElementSibling.querySelector('input').value)
      data.value = value
      console.log(value)
      if (isNaN(value)) {
        console.log('sdkfjsdolkfjsolidjfoiwneopifnwopenfopiwenofinweofnoweinfoienoiwenfion')
        Terminal.write(gid(`${pid}_terminal`), 'invalid data');
        return
      }
    }
    console.log(data)
    hermes.send_json(pid, data);
  },
  change_work_offset: function (pid, id, from_machine) {
    function get_val(cell) {
      return cell.querySelector('input').value
    }
    function set_val(cell, val) {
      cell.querySelector('input').value = val
    }
    cells = gid(`${pid}_work_offsets_table`).rows[id + 1].cells
    if (from_machine === true) { // we're putting the submition and reply in the same function
      console.log('apply')
      return
    }
    console.log('submit');
    let offset = {
      cmd: 'set_work_offset',
      name: get_val(cells[1]),
      x: parseFloat(get_val(cells[2])),
      y: parseFloat(get_val(cells[3])),
      z: parseFloat(get_val(cells[4])),
      a: parseFloat(get_val(cells[5])),
    }
    hermes.send_json(pid, offset)
    console.log(offset)
  },
  tabs: function (event, pid, tab_name) {
    let buttons = document.getElementById(`${pid}_tabs`).children;
    for (var i = 0; i < buttons.length; i++) {
      let button = buttons[i];
      if (button.classList.contains('green')) {
        console.log(button)
        button.classList.remove('green');
        button.classList.add('blue');
      }
    }
    event.target.classList.remove('blue');
    event.target.classList.add('green');

    machine = gid(`${pid}_machine`);
    work_offsets = gid(`${pid}_work_offsets`);
    tool_offsets = gid(`${pid}_tool_offsets`);
    term_tab = gid(`${pid}_term_tab`);

    machine.style.display = "none";
    work_offsets.style.display = "none";
    tool_offsets.style.display = "none";
    term_tab.style.display = "none";

    if (tab_name == 'machine') { machine.style.display = "block"; }
    else if (tab_name == 'work_offsets') { work_offsets.style.display = "block"; }
    else if (tab_name == 'tool_offsets') { tool_offsets.style.display = "block"; }
    else if (tab_name == 'term_tab') { term_tab.style.display = "block"; }
  },
  fk: function (pid, theta_deg, phi_deg, a_deg = null) {
    // forward kinematics
    let self = this.assets[pid];
    const theta = theta_deg * Math.PI / 180;
    const phi = phi_deg * Math.PI / 180;
    const c2 = (self.theta_2 + self.phi_2) - (2 * self.theta_len * self.phi_len * Math.cos(Math.PI - phi));
    const c = Math.sqrt(c2);
    const B = Math.acos((c2 + self.theta_2 - self.phi_2) / (2 * c * self.theta_len));
    const new_theta = theta + B;
    // we implicitly to the coordinate tranform here
    let y = -Math.cos(new_theta) * c;
    let x = Math.sin(new_theta) * c;
    return [x.toFixed(3), y.toFixed(3)];
  },
}