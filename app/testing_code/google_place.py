import requests
import os 
from dotenv import load_dotenv
from geopy.geocoders import Nominatim

load_dotenv()

GOOGLE_API_KEY = os.getenv('MAP_API_KEY')

def geocode_google(address, api_key):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
    response = requests.get(url).json()
    if response['status'] == 'OK':
        lat = response['results'][0]['geometry']['location']['lat']
        lng = response['results'][0]['geometry']['location']['lng']
        return (lat, lng)
    else:
        # Add this to handle non-OK responses
        print(f"Error: {response['status']}")
        print(f"Full response: {response}")
        return None  # Explicitly return None with error information
    
# Usage
coordinates = geocode_google("Nairobi, Kenya", GOOGLE_API_KEY)
print(coordinates)  # Should print coordinates or None with error info

print(GOOGLE_API_KEY)