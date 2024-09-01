#!/usr/bin/env python3

# This script will get the information for a specific tag
# from our active directory.

import ldap3
import sys, os

server_ip = os.getenv("LDAP_SERVER")
# Define the server and the base DN
server = ldap3.Server(f'ldap://{server_ip}', port=389)
base_dn = 'OU=Members,OU=Domain Users,DC=ad,DC=pumpingstationone,DC=org'
# And our credentials to bind as our server doesn't allow anonymous binds
# The user needs to be in the standard AD method of
# "ps1-ad\\<username>"
user = os.getenv("LDAP_USER")
password = os.getenv("LDAP_PASSWORD")

# Define the attributes to retrieve
attributes = ['cn', 'mail', 'sAMAccountName', 'givenName', 'sn']


def get_info_for_tag(tag: str) -> dict|None:
    # Create the connection
    with ldap3.Connection(server, 
                            user=user, 
                            password=password, auto_bind=True) as conn:

        # Define the search filter
        search_filter = f'(otherPager={tag})'
        
        # Now we're gonna search for the tag
        conn.search(search_base=base_dn, search_filter=search_filter, attributes=attributes)

        # Get the results
        if len(conn.entries) == 0:
            return {'Tag not found': f"Result was: {conn.result}"}

        # Cool, we got something
        entry = conn.entries[0]
        
        # Print the information
        return {
            'ad_name': f"{entry.sAMAccountName}",
            'email': f"{entry.mail}",
            'name': f'{entry.givenName} {entry.sn}'
        }
        
    

# # Get the tag from the command line
# if len(sys.argv) != 2:
#     print('Usage: get-info-for-tag.py <tag>')
#     sys.exit(1)

# tag = sys.argv[1]
# print(f"Search is: {search_filter.format(tag)}")