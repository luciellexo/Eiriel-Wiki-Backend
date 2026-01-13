import requests
import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    print("MONGO_URL not found")
    exit(1)

client = MongoClient(MONGO_URL)
db = client.get_database("app_db")
collection = db.get_collection("substances")

def sync_tripsit():
    print("Fetching data from TripSit (GitHub)...")
    try:
        # Fetching raw drugs.json from TripSit GitHub
        response = requests.get('https://raw.githubusercontent.com/TripSit/drugs/master/drugs.json', timeout=60)
        if response.status_code != 200:
            print(f"Failed to fetch TripSit data: {response.status_code}")
            return

        substances = response.json()
        print(f"Found {len(substances)} substances in TripSit.")

        count_new = 0
        count_updated = 0

        for key, val in substances.items():
            # key is the substance name usually (e.g., "LSD")
            # val contains properties
            
            # Normalize name for matching
            name = val.get('name', key)
            if not name:
                continue

            # Check if exists in DB (case insensitive)
            existing = collection.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
            
            if existing:
                # Merge logic: Only add if missing in PsychonautWiki data
                updates = {}
                if not existing.get('summary') and val.get('properties', {}).get('summary'):
                    updates['summary'] = val['properties']['summary']
                
                # Interactions (Combos)
                # TripSit has 'combos': {'2c-t-x': {'status': 'Unsafe'}, ...}
                if val.get('combos'):
                    current_interactions = existing.get('interactions_flat', [])
                    existing_interaction_names = {i['name'].lower() for i in current_interactions}
                    
                    for combo_name, combo_data in val['combos'].items():
                        if combo_name.lower() not in existing_interaction_names:
                            status_map = {
                                'Dangerous': 'Dangerous',
                                'Unsafe': 'Unsafe',
                                'Caution': 'Caution',
                                'Low Risk & Synergyl': 'Safe',
                                'Low Risk & Synergy': 'Safe',
                                'Low Risk & No Synergy': 'Safe',
                                'Low Risk & Decrease': 'Safe',
                                'Safe': 'Safe'
                            }
                            status = status_map.get(combo_data.get('status'), 'Unknown')
                            if status in ['Dangerous', 'Unsafe', 'Caution']:
                                current_interactions.append({
                                    'name': combo_name,
                                    'status': status,
                                    'note': combo_data.get('note', 'From TripSit')
                                })
                    updates['interactions_flat'] = current_interactions

                if updates:
                    collection.update_one({"_id": existing["_id"]}, {"$set": updates})
                    count_updated += 1

            else:
                # New Substance from TripSit
                # Create basic structure compatible with frontend
                new_sub = {
                    "name": name,
                    "summary": val.get('properties', {}).get('summary', 'No summary available.'),
                    "url": val.get('links', {}).get('wiki', None),
                    "featured": False,
                    "roas": [], # Populate if we can parse 'dose'
                    "images": None,
                    "interactions_flat": []
                }

                # Try to parse dosage if available in 'dose' key
                # TripSit 'dose' example: "dose": {"oral": {"light": 50, "common": 100...}}
                if val.get('dose'):
                    for method, doses in val['dose'].items():
                        if isinstance(doses, dict):
                            roa = {
                                "name": method,
                                "dose": {
                                    "units": val.get('formatted_dose', {}).get('units', 'mg'), # Fallback
                                    "threshold": None,
                                    "light": {"min": 0, "max": doses.get('light', 0)} if 'light' in doses else None,
                                    "common": {"min": doses.get('light', 0), "max": doses.get('common', 0)} if 'common' in doses else None,
                                    "strong": {"min": doses.get('common', 0), "max": doses.get('strong', 0)} if 'strong' in doses else None,
                                    "heavy": doses.get('heavy')
                                },
                                "duration": None 
                            }
                            # TripSit duration: "duration": {"oral": {"total": 360, "onset": 30...}} (in minutes)
                            if val.get('duration') and method in val['duration']:
                                dur = val['duration'][method]
                                roa['duration'] = {
                                    "total": {"min": dur.get('total', 0), "max": dur.get('total', 0), "units": "minutes"},
                                    "onset": {"min": dur.get('onset', 0), "max": dur.get('onset', 0), "units": "minutes"}
                                }
                            
                            new_sub['roas'].append(roa)

                # Interactions
                if val.get('combos'):
                    for combo_name, combo_data in val['combos'].items():
                         status = combo_data.get('status')
                         if status in ['Dangerous', 'Unsafe', 'Caution']:
                             new_sub['interactions_flat'].append({
                                 'name': combo_name,
                                 'status': status
                             })

                collection.insert_one(new_sub)
                count_new += 1

        print(f"TripSit Sync: Updated {count_updated}, Added {count_new}")

    except Exception as e:
        print(f"Error during TripSit sync: {e}")

if __name__ == "__main__":
    sync_tripsit()
