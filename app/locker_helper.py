import ldap

lockers = {
    'neverland/lockers': [],
    'neverland/floor': [],
    'neverland/pallet_racks': [],
}

def get_all_lockers():
    print('search AD and obtain all lockers data')
    for locker in lockers.keys():
        print(f"initializing: {locker}")
