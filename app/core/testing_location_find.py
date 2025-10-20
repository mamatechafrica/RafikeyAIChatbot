"""
Geocoding Tool for Clinic Finder
Integrates with SQL tools to find nearby clinics
"""
import os
from langchain.tools import tool
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_openai import ChatOpenAI
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = "postgresql+psycopg2://rafkey_db_3cj6_user:mi16PTKmSt9afoQILMSNfFIBPl27Kvtk@dpg-d0ec7uodl3ps73bjivm0-a.oregon-postgres.render.com/rafkey_db_3cj6?sslmode=require"

# LLM Config 
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0
)

# SQL TOOL
db = SQLDatabase.from_uri(DATABASE_URL)
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
sql_tools = toolkit.get_tools()

# Initialize geocoder
geolocator = Nominatim(user_agent="clinic_finder")

@tool
def geocode_location(location: str) -> dict:
    """
    Geocode a location string to get latitude and longitude coordinates.
    
    Args:
        location: Address or location name (e.g., "Nairobi, Kenya" or "Ruiru")
    
    Returns:
        Dictionary with latitude, longitude, and formatted address
    """
    try:
        result = geolocator.geocode(location, timeout=10)
        if result:
            return {
                "latitude": result.latitude,
                "longitude": result.longitude,
                "address": result.address,
                "success": True
            }
        else:
            return {"success": False, "error": "Location not found"}
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        return {"success": False, "error": str(e)}

@tool
def find_nearby_clinics(latitude: float, longitude: float, radius_km: float = 20.0) -> str:
    """
    Find clinics near the given coordinates within a specified radius.
    Uses the map_coordinates column which contains latitude,longitude pairs.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        radius_km: Search radius in kilometers (default: 20km)
    
    Returns:
        String with results of nearby clinics
    """
    # Parse coordinates and calculate distance using Haversine formula
    query = f"""
    SELECT 
        "Clinic Name",
        "Services",
        "Category",
        "Location",
        "Contacts",
        "Website",
        "Map Coordinates (Latitude and Longitude)",
        (6371 * acos(
            cos(radians({latitude})) * 
            cos(radians(CAST(split_part("Map Coordinates (Latitude and Longitude)", ',', 1) AS FLOAT))) * 
            cos(radians(CAST(split_part("Map Coordinates (Latitude and Longitude)", ',', 2) AS FLOAT)) - radians({longitude})) + 
            sin(radians({latitude})) * 
            sin(radians(CAST(split_part("Map Coordinates (Latitude and Longitude)", ',', 1) AS FLOAT)))
        )) AS distance_km
    FROM clinics
    WHERE "Map Coordinates (Latitude and Longitude)" IS NOT NULL
    AND (6371 * acos(
            cos(radians({latitude})) * 
            cos(radians(CAST(split_part("Map Coordinates (Latitude and Longitude)", ',', 1) AS FLOAT))) * 
            cos(radians(CAST(split_part("Map Coordinates (Latitude and Longitude)", ',', 2) AS FLOAT)) - radians({longitude})) + 
            sin(radians({latitude})) * 
            sin(radians(CAST(split_part("Map Coordinates (Latitude and Longitude)", ',', 1) AS FLOAT)))
        )) <= {radius_km}
    ORDER BY distance_km
    LIMIT 10;
    """
    
    try:
        result = db.run(query)
        return result if result else "No clinics found in the specified radius."
    except Exception as e:
        return f"Error querying database: {str(e)}"

# Combine all tools
all_tools = sql_tools + [geocode_location, find_nearby_clinics]

# Create agent
agent = create_react_agent(llm, all_tools)

# Example usage
if __name__ == "__main__":
    while True:
        # user_location = "Find clinics near Ruiru, kenya. First geocode the location, then search for clinics within 20km."
        user_location = input("Enter a location: ")
        
        # response = agent.invoke({
        #     "messages": [
        #         f"Find clinics near {user_location}. First geocode the location, then search for clinics within 20km."
        #     ]
        # })
        

        for chunk, metadata in agent.stream({"messages": [{"role": "user", "content": user_location}]}, stream_mode="messages"):
            if metadata['langgraph_node'] == "agent" and chunk.content:
                print(f"{chunk.content}", end="", flush=True)
        # print(response["messages"][-1].content)