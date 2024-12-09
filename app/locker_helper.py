import ldap
from datetime import datetime, timedelta

lockers = {
    'neverland/lockers': [],
    'neverland/floor': [],
    'neverland__pallet_racks': [
    [{"name":"Eric Beauchamp","address":1,"status":"owned"},
     {"name":"George Hoffman","address":6,"status":"owned"},
     {"name":"","address":11,"status":"empty"},
     {"name":"","address":16,"status":"empty"},
     {"name":"","address":21,"status":"empty"},
     {"name":"Andrew Eubanks ","address":26,"status":"owned"}],
    
    [{"name":"","address":2,"status":"empty"},
     {"name":"Andrew E.H.","address":7,"status":"owned"},
     {"name":"Chris Hartman","address":12,"status":"owned"},
     {"name":"","address":17,"status":"empty"},
     {"name":"","address":22,"status":"empty"},
     {"name":"","address":27,"status":"empty"}],
    
    [{"name":"Maria Savrasova","address":3,"status":"owned"},
     {"name":"Abel Mebratu","address":8,"status":"owned"},
     {"name":"","address":13,"status":"empty"},
     {"name":"Brian Desmond","address":18,"status":"owned"},
     {"name":"Anthony Lighthall","address":23,"status":"owned"},
     {"name":"Atticus Lazenby ","address":28,"status":"owned"}],
    
    [{"name":"Micah Kephart","address":4,"status":"owned"},
     {"name":"","address":9,"status":"empty"},
     {"name":"","address":14,"status":"empty"},
     {"name":"Mark Nielsen","address":19,"status":"owned"},
     {"name":"","address":24,"status":"empty"},
     # {"name":"","address":29,"status":"empty"}],
     {"name":"test1","address":29,"status":"full","date":"2024-09-15T06:08:45.614Z"}],
    
    [{"name":"Joshua Samos","address":5,"status":"owned"},
     {"name":"","address":10,"status":"empty"}, 
     {"name":"","address":15,"status":"empty"},
     {"name":"","address":20,"status":"empty"},
     {"name":"","address":25,"status":"empty"},
     {"name":"Andrew Masek","address":30,"status":"owned"}]
],
}

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

        
        
