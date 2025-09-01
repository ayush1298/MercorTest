import requests
import json

def fetch_data_from_url(url):
    """
    Fetch data from the given URL and return the JSON content
    """
    try:
        # Make a GET request to the URL
        response = requests.get(url)
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Parse the JSON data
        data = response.json()
        
        return data
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return None

def main():
    # Your file URL
    url = "https://file.notion.so/f/f/f86ed84d-b33c-4dfb-b0e0-97c5661516a3/3ed586a1-78e7-46af-9cf1-0961f95b5109/form-submissions-1.json?table=block&id=18a5392c-c93e-8054-b617-eb2a1a213d6c&spaceId=f86ed84d-b33c-4dfb-b0e0-97c5661516a3&expirationTimestamp=1756770486265&signature=UBfYjuVNS0f3a_NW8UIxPZ0x6oLfJPhqZavhvThyZC8&downloadName=form-submissions.json"
    
    print("Fetching data from the URL...")
    data = fetch_data_from_url(url)
    
    if data is not None:
        print("Data fetched successfully!")
        print("\nData preview:")
        print(json.dumps(data, indent=2))
        
        # You can also save the data to a local file
        with open('form-submissions.json', 'w') as f:
            json.dump(data, f, indent=2)
        print("\nData saved to 'form-submissions.json'")
        
        # Print some basic info about the data
        if isinstance(data, list):
            print(f"\nFound {len(data)} items in the data")
        elif isinstance(data, dict):
            print(f"\nData contains {len(data)} keys: {list(data.keys())}")
    else:
        print("Failed to fetch data")

if __name__ == "__main__":
    main()