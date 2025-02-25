import ldap
from datetime import datetime, timedelta

lockers = {
    'neverland/lockers': [],
    'neverland/floor': [],
    'neverland__pallet_racks': [
    [{"name":"","address":1,"status":"empty"},
     {"name":"","address":2,"status":"empty"},
     {"name":"","address":3,"status":"empty"},
     {"name":"","address":4,"status":"empty"},
     {"name":"","address":5,"status":"empty"},
     {"name":"","address":6,"status":"empty"},
     {"name":"","address":7,"status":"empty"},
     {"name":"","address":8,"status":"empty"},
     {"name":"","address":9,"status":"empty"},
     {"name":"","address":10,"status":"empty"},
     ],
    
    [{"name":"","address":11,"status":"empty"},
     {"name":"","address":12,"status":"empty"},
     {"name":"","address":13,"status":"empty"},
     {"name":"","address":14,"status":"empty"},
     {"name":"","address":15,"status":"empty"},
     {"name":"","address":16,"status":"empty"},
     {"name":"","address":17,"status":"empty"},
     {"name":"","address":18,"status":"empty"},
     {"name":"","address":19,"status":"empty"},
     {"name":"","address":20,"status":"empty"},
     ],
    
    [{"name":"","address":21,"status":"empty"},
     {"name":"","address":22,"status":"empty"},
     {"name":"","address":23,"status":"empty"},
     {"name":"Ian Sampson","address":24,"status":"owned"},
     {"name":"","address":25,"status":"empty"},
     {"name":"","address":26,"status":"empty"},
     {"name":"","address":27,"status":"empty"},
     {"name":"","address":28,"status":"empty"},
     {"name":"","address":29,"status":"empty"},
     {"name":"","address":30,"status":"empty"},
     ],
    
    [{"name":"Bruno Cardoso","address":31,"status":"owned"},
     {"name":"Andrew Masek","address":32,"status":"owned"},
     {"name":"Joshua Samos","address":33,"status":"owned"},
     {"name":"Abel Mebratu","address":34,"status":"owned"},
     {"name":"Michael Sprinker","address":35,"status":"owned"},
     {"name":"Avery","address":36,"status":"owned"},
     {"name":"Micah Kephart","address":37,"status":"owned"},
     {"name":"Nick Chiado","address":38,"status":"owned"},
     {"name":"Andrew Eubanks","address":39,"status":"owned"},
     {"name":"Brian Desmond","address":40,"status":"owned"},
     ],
    
    [{"name":"Maria Savrasova","address":41,"status":"owned"},
     {"name":"Chris Hartman","address":42,"status":"owned"},
     {"name":"Carter Robinson","address":43,"status":"owned"},
     {"name":"Nick Hawley","address":44,"status":"owned"},
     {"name":"Franklin Walton","address":45,"status":"owned"},
     {"name":"Mark Nielsen","address":46,"status":"owned"},
     {"name":"Harrison K","address":47,"status":"owned"},
     {"name":"Erica Canavan","address":48,"status":"owned"},
     {"name":"Greg Ybos","address":49,"status":"owned"},
     {"name":"Andrew Locke","address":50,"status":"owned"},
     ],
    
    [{"name":"","address":51,"status":"empty"},
     {"name":"","address":52,"status":"empty"},
     {"name":"","address":53,"status":"empty"},
     {"name":"","address":54,"status":"empty"},
     {"name":"","address":55,"status":"empty"},
     {"name":"","address":56,"status":"empty"},
     {"name":"","address":57,"status":"empty"},
     {"name":"","address":58,"status":"empty"},
     {"name":"","address":59,"status":"empty"},
     {"name":"","address":60,"status":"empty"},
     ],
    ],
}

# {"name":"test1","address":29,"status":"full","date":"2025-01-11T06:08:45.614Z"}
# {"name":"Mark Nielsen","address":19,"status":"owned"},

def get_all_lockers():
    print('fake search AD and obtain all lockers data')
    for locker in lockers.keys():
        print(f"initializing: {locker}")

def claim_locker(pod, user, address):
    future_time = datetime.now() + timedelta(hours=24)
    future_time = future_time.isoformat() + "Z"
    print(future_time)
    new_state = {"name":user,"address":address,"status":"full","date":future_time}
    print(new_state)
    for row in lockers[pod]:
        for locker in row:
            if locker['address'] == address:
                locker.update(new_state)
                
def update_locker(data):
    # print(data)
    pod = data['pod']
    address = data['address']
    new_state = data['status']
    
    for row in lockers[pod]:
        for locker in row:
            if locker['address'] == address:
                locker['status'] = new_state
                locker['name'] = data['name']
                # if new_state == 'empty':
                #     locker['date'] = None
                # else:
                #     future_time = datetime.now() + timedelta(hours=24)
                #     future_time = future_time.isoformat() + "Z"
                #     locker['date'] = future_time

def package_lights(pod):
    colors = {
        'empty': 0,
        'full': 1,
        'warn': 2,
        'owned': 3,
    }
    status = [colors[locker['status']] for row in pod for locker in row]
    print(status)
    msg = 0
    for locker in status:
        msg <<= 2
        msg += locker
    # print(load, status)
    print(msg)

        
        
