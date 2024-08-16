import ldap

lockers = {
    'neverland/lockers': [],
    'neverland/floor': [],
    'pallet_racks': [
    [{"name":"","address":1,"status":"empty"},{"name":"","address":6,"status":"empty"},{"name":"Harry Spyceddragon","address":11,"status":"owned"},{"name":"","address":16,"status":"empty"},{"name":"","address":21,"status":"empty"},{"name":"","address":26,"status":"empty"}],
    [{"name":"","address":2,"status":"empty"},{"name":"","address":7,"status":"empty"},{"name":"test2","address":12,"status":"full","date":"2024-08-25T05:08:45Z"},{"name":"","address":17,"status":"empty"},{"name":"test again","address":22,"status":"owned"},{"name":"","address":27,"status":"empty"}],
    [{"name":"","address":3,"status":"empty"},{"name":"","address":8,"status":"empty"},{"name":"","address":13,"status":"empty"},{"name":"Dan Ennion","address":18,"status":"owned"},{"name":"","address":23,"status":"empty"},{"name":"","address":28,"status":"empty"}],
    [{"name":"","address":4,"status":"empty"},{"name":"","address":9,"status":"empty"},{"name":"","address":14,"status":"empty"},{"name":"","address":19,"status":"empty"},{"name":"James Lamken","address":24,"status":"owned"},{"name":"test1","address":29,"status":"full","date":"2024-08-15T06:08:45.614Z"}],
    [{"name":"","address":5,"status":"empty"},{"name":"","address":10,"status":"empty"}, {"name":"","address":15,"status":"empty"},{"name":"","address":20,"status":"empty"},{"name":"Harry Spyceddragon","address":25,"status":"owned"},{"name":"test2","address":30,"status":"full","date":"2024-08-21T05:20:45.614Z"}]
],
}

def get_all_lockers():
    print('search AD and obtain all lockers data')
    for locker in lockers.keys():
        print(f"initializing: {locker}")
