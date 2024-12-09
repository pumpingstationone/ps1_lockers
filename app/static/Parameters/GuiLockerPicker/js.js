var GuiLockerPicker = {
  lockers: {},  // pid: lockers
  websockets: {},  // pid: Websocket
  pids: {},  // name: pid
  current_user: null,
  getHTML: function (param) {
    return `{{ html }}`
  },
  renderTable: function (pid) {
    const table = document.getElementById(`${pid}_lockersTable`);
    const lockers = this.lockers[pid]
    // Clear existing rows
    while (table.rows.length > 0) {
      table.deleteRow(0);
    }
    const columnCount = lockers[0].length;
    const columnWidth = 100 / columnCount;
    lockers.forEach(row => {
      const tr = document.createElement('tr');

      row.forEach(locker => {
        const timeRemaining = Math.round((new Date(locker.date) - new Date())/1000);
        locker.timeRemaining = timeRemaining;
        const td = document.createElement('td');
        const timeRemainingText = locker.status === 'full' ? `<br>time remaining: <span class="time-remaining" data-address="${locker.address}">${this.formatTime(timeRemaining)}</span>` : '';
        const dateText = locker.status === 'full' ? `<br>date: ${new Date(locker.date).toLocaleString()}` : '';
        const claimButton = locker.status === 'empty' ? `<br><button class="claim_button" onclick="GuiLockerPicker.claimLocker(${pid}, ${locker.address})">Claim</button>` : '';
        td.innerHTML = `name: ${locker.name || 'N/A'}<br>address: <span class="large-text">${locker.address}</span><br>status: ${locker.status}${dateText}${timeRemainingText}${claimButton}`;
        td.className = this.getLockerClass(locker);
        td.style.width = `${columnWidth}%`;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  },
  formatTime: function (seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  },
  getLockerClass: function (locker) {
    if (locker.status === 'full') {
      return locker.timeRemaining < 86400 ? 'full-warning' : 'full'; // 86400 seconds = 1 day
    }
    return locker.status;
  },
  updateTimeRemaining: function () {
    const timeElements = document.querySelectorAll('.time-remaining');
    timeElements.forEach(el => {
      const address = parseInt(el.getAttribute('data-address'));
      for (const lockers of Object.values(GuiLockerPicker.lockers)) {
        const locker = lockers.flat().find(locker => locker.address === address);
        if (locker && locker.timeRemaining > 0) {
          locker.timeRemaining--;
          el.textContent = GuiLockerPicker.formatTime(locker.timeRemaining);
          el.closest('td').className = GuiLockerPicker.getLockerClass(locker);
        }
      }
    });
  },
  updateLockerInfo: function (pid, name, address, status, days = 0) {
    this.lockers[pid].forEach(row => {
      row.forEach(locker => {
        if (locker.address === address) {
          locker.name = name;
          locker.status = status;
          if (status === 'full') {
            locker.date = new Date();
            locker.date.setSeconds(locker.date.getSeconds() + days * 24 * 3600);
            locker.timeRemaining = days * 24 * 3600; // Convert days to seconds
          } else {
            delete locker.date;
            delete locker.timeRemaining;
          }
        }
      });
    });
    this.renderTable(pid);
  },
  claimLocker: function (pid, address) {
    GuiLockerPicker.setClaimButtons('hide');
    if (confirm(`Claim button clicked for locker with pid, address: ${pid}, ${address}`)) {
      console.log(`${GuiLockerPicker.current_user} wants locker ${address}`);
      // this is a hack. Fix once you understand better what should happen
      if (GuiLockerPicker.websockets){
        let pod = Object.keys(GuiLockerPicker.websockets)[0];
        let _ws = GuiLockerPicker.websockets[pod];
        let msg = JSON.stringify({
          cmd: 'claim',
          name: GuiLockerPicker.current_user,
          address: address,
          pod: pod,
        });
        console.log(msg);
        _ws.send(msg)
      }
      
      // this is for edgeboards
      hermes.send_json(pid, {
        cmd: 'get_locker', 
        user: GuiLockerPicker.current_user,
        pid: pid,
        address: address,
      })

      // this is for ps1
      console.log('this socket', GuiLockerPicker.websockets[pid])

    }
  },
  setClaimButtons: function (display) {
    const buttons = document.getElementsByClassName('claim_button');
    for (const button of buttons) {
      if (display === 'hide') {
        button.style.display = 'none';
      }
      else {
        button.style.display = 'inline-block';
      }
    }
  },
  init: function (param) {
    console.log('POD', param.pod)
    this.lockers[param.pid] = param.pod
    this.pids[param.name] = param.pid
    if (param.websocket != "") {
      let gl_ws = new WebSocket(param.websocket);
      this.websockets[param.name] = gl_ws;
      let self = this;
      gl_ws.onmessage = function (event) {
        let cmd = JSON.parse(event.data)
        if (cmd.cmd === 'connected') {
          // { cmd: "connected", name: "pallet_racks" }
          console.log('connected', cmd);
          let resp = JSON.stringify({cmd: 'get', 'name': cmd.name})
          self.websockets[cmd.name].send(resp)
        }
        if (cmd.cmd === 'renderTable') {
          // {cmd: renderTable, name: name, pod: dict}
          console.log('renderTable', cmd);
          let pid = self.pids[cmd.name]
          self.lockers[pid] = cmd.pod;
          self.renderTable(pid)
        }
        if (cmd.cmd == 'choose_locker') {
          console.log(this)
          GuiLockerPicker.current_user = cmd.user
          GuiLockerPicker.setClaimButtons('show');
          setTimeout(() => GuiLockerPicker.setClaimButtons('hide'), 30000);
      	}
      }
    }
    else {
      // We must just be running locally and have a pod
      this.renderTable(param.pid)
    }
    setInterval(this.updateTimeRemaining, 1000);
    hermes.p[param.pid] = function (pid, data) {
      data = JSON.parse(data);
      console.log(data)
      if (data['cmd'] == 'update_locker') {
        GuiLockerPicker.updateLockerInfo(pid, data.name, data.address, data.status, data.days)
      }
      if (data['cmd'] == 'choose_locker') {
        console.log(this)
        GuiLockerPicker.current_user = data.user
        GuiLockerPicker.setClaimButtons('show');
        setTimeout(() => GuiLockerPicker.setClaimButtons('hide'), 30000);
      }
      if (data['cmd'] == 'render_table') {
        console.log(data);
        GuiLockerPicker.lockers[pid] = data.pod
        GuiLockerPicker.renderTable(pid)
      }
    }
  },
}