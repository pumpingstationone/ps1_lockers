var GuiPnpFeeder = {
  getHTML: function (param) {

    return `{{ html }}`
  },
  create_feeder_table: function (param) {
    let rows = [];
    for (let i = 0; i < param.num_feeders; i++) {
      rows.push(`
      <tr>
  <td>feeder: ${i}</td>
  <td><input type="text" style="width: 100%;" id="${param.pid}_val_${i}" onchange="GuiPnpFeeder.change(${param.pid}, '${param.pid}_val_${i}')" value="${i}_bbb"></td>
  <td><input type="number" style="width: 100%;" id="${param.pid}_xpos_${i}" onchange="GuiPnpFeeder.change(${param.pid}, '${param.pid}_xpos_${i}')"></td>
  <td><input type="number" style="width: 100%;" id="${param.pid}_ypos_${i}" onchange="GuiPnpFeeder.change(${param.pid}, '${param.pid}_ypos_${i}')"></td>
  <td><input type="number" style="width: 100%;" id="${param.pid}_zpos_${i}" onchange="GuiPnpFeeder.change(${param.pid}, '${param.pid}_zpos_${i}')"></td>
  <td><input type="number" style="width: 100%;" id="${param.pid}_apos_${i}" onchange="GuiPnpFeeder.change(${param.pid}, '${param.pid}_apos_${i}')"></td>
  <td><button class="xsm_button blue" onclick="GuiPnpFeeder.send(${param.pid}, 'set', ${i})">set</button></td>
  <td><button class="xsm_button green" onclick="GuiPnpFeeder.send(${param.pid}, 'feed', ${i})">feed</button></td>
</tr>`)
    }
    return rows.join('');
  },
  get_data: function (pid) {
    let table = gid(`${pid}_table`)
    let data = {};
    for (let i = 0; i < table.rows.length; i++) {
      if (i == 0) { continue };
      const row = table.rows[i];
      const val = row.cells[1].querySelector('input').value;
      data[val] = {
        "id": i - 1,
        "x": parseFloat(row.cells[2].querySelector('input').value),
        "y": parseFloat(row.cells[3].querySelector('input').value),
        "z": parseFloat(row.cells[4].querySelector('input').value),
        "a": parseFloat(row.cells[5].querySelector('input').value),
      }
    }
    console.log(data);
    return data
  },
  change: function (pid, element) {
    console.log(gid(element))
    gid(element).style.backgroundColor = "#ff8b8b";
    gid(`${pid}_save_button`).style.backgroundColor = "#068770"
  },
  set_all: function (pid, data) {
    let table = gid(`${pid}_table`)
    for (component in data) {
      const comp = data[component]
      const row = table.rows[comp.id + 1]
      row.cells[1].querySelector('input').value = component
      row.cells[2].querySelector('input').value = comp.x
      row.cells[3].querySelector('input').value = comp.y
      row.cells[4].querySelector('input').value = comp.z
      row.cells[5].querySelector('input').value = comp.a
    }
  },
  send: function (pid, action, payload) {
    data = {};
    if (action == 'feed') {
      data['feed'] = payload;
    }
    else if (action == 'save_rack') {
      data['save_rack'] = this.get_data(pid);
    }
    else if (action == 'set') {
      data['set'] = payload;
    }
    else if (action == 'set_pos') {
      data['set_pos'] = payload;
    }
    hermes.send_json(pid, data);
  },
  set_feeder: function (pid, data) {
    // return from when the set button was hit
    let table = gid(`${pid}_table`)
    const color = "#ff8b8b"
    for (component in data) {
      const row = table.rows[data.feeder + 1]
      row.cells[1].querySelector('input').style.backgroundColor = color
      row.cells[2].querySelector('input').value = data.x
      row.cells[2].querySelector('input').style.backgroundColor = color
      row.cells[3].querySelector('input').value = data.y
      row.cells[3].querySelector('input').style.backgroundColor = color
      row.cells[4].querySelector('input').value = data.z
      row.cells[4].querySelector('input').style.backgroundColor = color
      row.cells[5].querySelector('input').value = data.a
      row.cells[5].querySelector('input').style.backgroundColor = color
    }
    gid(`${pid}_save_button`).style.backgroundColor = color;
  },
  saved: function (pid) {
    gid(`${pid}_save_button`).style.backgroundColor = "#6c6c6c";
    const color = "#304050"
    let table = gid(`${pid}_table`)
    let first = true;
    for (const row of table.rows) {
      if (!first) {
        row.cells[1].querySelector('input').style.backgroundColor = color
        row.cells[2].querySelector('input').style.backgroundColor = color
        row.cells[3].querySelector('input').style.backgroundColor = color
        row.cells[4].querySelector('input').style.backgroundColor = color
        row.cells[5].querySelector('input').style.backgroundColor = color
      }
      first = false
    }
  },

  init: function (param) {
    this.set_all(param.pid, param.rack)
    hermes.p[param.pid] = function (pid, data) {
      data = JSON.parse(data);
      if (data['cmd'] == 'set_feeder') {
        // console.log(data)
        GuiPnpFeeder.set_feeder(pid, data)
      }
      if (data['cmd'] == 'saved') {
        GuiPnpFeeder.saved(pid)
      }
    }
  },
}