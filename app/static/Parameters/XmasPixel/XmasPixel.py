from floe import make_var

class XmasPixel:
    """ color animation for Neo
    """
    RGB = bytearray
    struct = 'i'  # buffer
    
    def __init__(self, pid, iris, **k) -> None:
        self.pid = pid        
        self.index = 0

        iris.p[pid] = self       

    def animate(self, neo, index):
        index %= neo.num_pix
        for pixel in range(neo.num_pix):
            if index == pixel:
                neo.neo[pixel] = self.dot_color.state
            else:
                neo.neo[pixel] = self.fill_color.state
        neo.neo.write()
    
    def update(self):
        pass
    
    def gui(self):
        pass

    