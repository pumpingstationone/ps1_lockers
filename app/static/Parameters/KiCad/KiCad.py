from floe import FP, make_var
from Parameter import Parameter
import json
    
Ref = 0
Val = 1
Package = 2
PosX = 3
PosY = 4
Rot = 5
Side = 6

class KiCad(Parameter):
    struct = 'str'  # bool
    
    def __init__(self, *, feeders, board_offset = {}, **k):
        super().__init__(**k)
        self.feeders = make_var(feeders)
        self.csv_is_open = False
        
        self.work_offset = {}
        self.board_offset = make_var(board_offset)
        
        self.z_clear = 0      
        
    def update(self):
        super().update()
        # self.board_offset = self.board_offset.state
        
    def __call__(self, state) -> None:
        if state is not None:
            l = (json.dumps(line) for line in self.gen(state))
            self.state = '\n'.join(l)
        self.send()
        
    def _create_gen(self, string):
        # we have gotten a string that composed like JSON lines
        def _gen(iterable):
            for line in iterable:
                yield line
        iterable = string.split('\n')
        g = _gen(iterable)
        next(g) # move past first line of csv
        return g
    
    def gen(self, object):
        if isinstance(object, Parameter):
            g = self._create_gen(object.state)
            for line in g:
                _line = self._get_valid_line(line)
                if _line:
                    yield from self._parse_line(_line)
        elif isinstance(object, str):
            print('got string')
            g = self._create_gen(object)
            for line in g:
                _line = self._get_valid_line(line)
                if _line:
                    yield from self._parse_line(_line)        
        else:
            with open(object, 'r') as f:
                f.readline() # move past first line of csv
                for line in f:
                    _line = self._get_valid_line(line)
                    if _line:
                        yield from self._parse_line(_line)

    # def verify(self):
    #     skipped = set()
    #     for line in self.open_csv():
    #         line = line.split(',')
    #         if line[Val] not in self.feeders.state:
    #             skipped.add(line[Val])
    #     return skipped
        
    def _get_valid_line(self, line):
        line = line.replace('"', "")
        # self.iris.bifrost.post(line)
        if line:
            return line
        
    def _parse_all(self, generator):
        for line in generator:
            _line = self._get_valid_line(line)
            if _line:
                yield from self._parse_line(_line)

   
    def _parse_line(self, line):
        print(line)
        line = line.split(',')
        self.iris.bifrost.post(line)
        if line[Val] in self.feeders.state:
            yield dict(cmd='eval', eval=f'GuiPnpFeeder({self.feeders.state[line[Val]]["id"]})', comment=line[Val])
            yield from self._pick(line)
            yield from self._place(line)
        else:
            print('skipped', line[Val])   

    def _pick(self, component):
        # print(f"picking {component}")
        self.work_offset = {}
        comp = self.feeders.state[component[Val]]
        yield dict(cmd='move.rapid', x=comp['x'], y=comp['y'], a=comp['a'], feed=1200)
        yield dict(cmd='move.linear', z=comp['z'])
        yield {'cmd': 'eval', 'eval': 'suck(True)'}
        yield dict(cmd='move.linear', z=self.z_clear)


    def _place(self, component):
        # This needs to be looked into further. Where should work offset be calculated?? For now I'm thinking this module should calculate it
        # if self.board_offset.state:
        #     yield dict(cmd='set_work_offset', offset=self.board_offset.state)
        # else:
        #     yield dict(cmd='set_work_offset', offset='board_offset')
        
        pos = dict(cmd='move.rapid', x=float(component[PosX]), y=float(component[PosY]), a=float(component[Rot]), feed=1200)
        yield self._apply_offset(pos)
        yield dict(cmd='move.linear', z=self.work_offset['z'])
        yield {'cmd': 'eval', 'eval': 'suck(False)'}
        yield {'cmd': 'sleep', 'seconds': 1}
        # yield dict(cmd='set_work_offset', offset='clear_offsets')
        yield dict(cmd='move.rapid', z=self.z_clear, comment='part placed moving z')

    def _apply_offset(self, pos):  # TODO: change this out for CNCTranslator object
        self.work_offset = self.board_offset.state
        for axis, val in self.work_offset.items():
            if axis in pos:
                pos[axis] += val
        return pos
    