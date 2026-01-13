import requests
import json

query = """
{
    substances(limit: 5) {
        name
        roas {
            name
            dose {
                units
                threshold
                light { min max }
                common { min max }
                strong { min max }
                heavy
            }
        }
        dangerousInteractions {
            name
        }
    }
}
"""

try:
    response = requests.post('https://api.psychonautwiki.org/', json={'query': query})
    if response.status_code == 200:
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
