import os
import requests
import json
from urllib.parse import urlparse

# Get supabase details from .env
with open('.env', 'r') as f:
    env_vars = {}
    for line in f:
        if '=' in line:
            k, v = line.strip().split('=', 1)
            env_vars[k] = v

url = f"{env_vars.get('VITE_SUPABASE_URL')}/rest/v1/posts?select=*"
headers = {
    'apikey': env_vars.get('VITE_SUPABASE_ANON_KEY'),
    'Authorization': f"Bearer {env_vars.get('VITE_SUPABASE_ANON_KEY')}",
    'Range': '0-0'
}

response = requests.get(url, headers=headers)
print("Columns in posts:", json.dumps(response.json()[0].keys() if response.json() else [], indent=2))
