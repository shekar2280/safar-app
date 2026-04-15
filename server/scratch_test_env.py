import os
from app.config import settings
import json

print(f"App Name: {settings.app_name}")
if settings.firebase_service_account_json:
    print("Found firebase_service_account_json")
    try:
        data = json.loads(settings.firebase_service_account_json)
        print(f"Project ID: {data.get('project_id')}")
        print("Success: JSON is valid!")
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        print(f"Raw content length: {len(settings.firebase_service_account_json)}")
        print(f"Raw content start: {settings.firebase_service_account_json[:50]}")
else:
    print("Error: firebase_service_account_json is empty!")
