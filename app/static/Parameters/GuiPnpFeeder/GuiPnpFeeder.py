from Parameter import Parameter
from floe import make_var
import json

class GuiPnpFeeder(Parameter):
    struct = 'i'  # int
    
    def __init__(self, *, name: str = "", num_feeders, machine, rack=False, **k):
        super().__init__(name=name, **k)
        self.name = name
        

        if rack:
            self.rack = make_var(rack)
        else:
            self.rack = make_var({})
        self.num_feeders = 0
            
        self.machine = make_var(machine)
    
    def update(self):
        super().update()
        self.num_feeders = len(self.rack.state)
        element = {"name": self.name, "pid": self.pid, "rack": self.rack.state, "num_feeders":self.num_feeders, "type": "GuiPnpFeeder"}
        self.iris.webstuff.append(element)
    
    def find_feeder(self, index):
        for name, data in self.rack.state.items():
            if data['id'] == index:
                return name

    def set_feeder(self, index, positions):
        comp_name = self.find_feeder(index)
        for axis, val in positions.items():
            self.rack.state[comp_name][axis] = val
            
        print(self.rack.state)
        
    def __call__(self, state, gui=False):
        if gui:
            state = json.loads(state)
            print(state)
            if 'feed' in state:
                super().__call__(state['feed'])
                # self.send()
            elif 'save_rack' in state:
                print('saving rack')
                self.rack(state['save_rack'])
                self.iris.bifrost.send(self.pid, {'cmd': 'saved'})
            elif 'set' in state:
                print('setting')
                index = state['set']
                cpos = self.machine.get_pos(kinematics = 'cartesian')
                position = {'cmd':'set_feeder', 'feeder': index}
                position.update(cpos)
                print(position)
                self.set_feeder(index, cpos)
                self.iris.bifrost.send(self.pid, position)
        else:
            super().__call__(state)
        # if not gui:
        #     self.iris.bifrost.send(self.pid, self.state)
    
    def gui(self):
        return {"name": self.name, "pid": self.pid, "rack": self.rack.state, "num_feeders":self.num_feeders, "type": "GuiPnpFeeder"}
    
    def feed(self):
        pass
        


    