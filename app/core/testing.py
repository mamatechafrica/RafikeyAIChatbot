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
geolocator = Nominatim(user_agent="clinic_finder_kenya_v1")


# GEOCODING TOOL
@tool
def geocode_user_location(location_name: str) -> str:
    """
    Convert a location name in Kenya to latitude and longitude coordinates.
    
    Use this tool FIRST when a user asks to find clinics near a location.
    This will give you the coordinates needed to search the database.
    
    Args:
        location_name: Name of the location (e.g., "Westlands", "Karen", "Nairobi", "Mombasa")
        
    Returns:
        String containing latitude and longitude, or error message if geocoding fails
    """
    try:
        # Ensure Kenya is included in the search
        search_location = location_name
        if "kenya" not in location_name.lower():
            search_location = f"{location_name}, Kenya"
        
        # Geocode the location
        location = geolocator.geocode(search_location, timeout=10)
        
        if location:
            result = f"Location found: {location.address}\n"
            result += f"Latitude: {location.latitude}\n"
            result += f"Longitude: {location.longitude}\n"
            result += f"\nUse these coordinates to search for nearby clinics in the database."
            return result
        else:
            return f"Could not find coordinates for '{location_name}'. Please try a different location name or be more specific (e.g., 'Westlands, Nairobi' instead of just 'Westlands')."
            
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        return f"Geocoding service temporarily unavailable: {str(e)}. Please try again."
    except Exception as e:
        return f"Error while geocoding location: {str(e)}"


# CLINIC SEARCH TOOL
@tool
def find_clinics_near_coordinates(latitude: float, longitude: float, max_distance_km: int = 20) -> str:
    """
    Find clinics within a specified distance from given coordinates.
    
    Use this tool AFTER geocoding a location to find nearby healthcare facilities.
    Returns up to 5 closest clinics with all their details.
    
    Args:
        latitude: Latitude coordinate (e.g., -1.2921)
        longitude: Longitude coordinate (e.g., 36.8219)
        max_distance_km: Maximum search radius in kilometers (default: 20, max: 50)
        
    Returns:
        Formatted list of clinics with details including distance, or message if none found
    """
    try:
        # Validate inputs
        if not (-90 <= latitude <= 90):
            return "Invalid latitude. Must be between -90 and 90."
        if not (-180 <= longitude <= 180):
            return "Invalid longitude. Must be between -180 and 180."
        if max_distance_km > 50:
            max_distance_km = 50
        if max_distance_km < 1:
            max_distance_km = 1
        
        # SQL query using Haversine formula
        query = f"""
            SELECT 
                clinic_name,
                services,
                category,
                location,
                contacts,
                website,
                latitude,
                longitude,
                ROUND(
                    CAST(
                        6371 * acos(
                            cos(radians({latitude})) * 
                            cos(radians(latitude)) * 
                            cos(radians(longitude) - radians({longitude})) + 
                            sin(radians({latitude})) * 
                            sin(radians(latitude))
                        ) AS NUMERIC
                    ), 2
                ) AS distance_km
            FROM clinics
            WHERE (
                6371 * acos(
                    cos(radians({latitude})) * 
                    cos(radians(latitude)) * 
                    cos(radians(longitude) - radians({longitude})) + 
                    sin(radians({latitude})) * 
                    sin(radians(latitude))
                )
            ) <= {max_distance_km}
            ORDER BY distance_km ASC
            LIMIT 5;
        """
        
        # Execute query using the db object
        result = db.run(query)
        
        # Check if we got results
        if not result or result == "[]" or "Error" in str(result):
            return f"No clinics found within {max_distance_km}km of coordinates ({latitude}, {longitude}). Try increasing the search radius or checking a different location."
        
        # Parse and format the results
        import json
        try:
            # Try to parse as JSON if it's in that format
            clinics = json.loads(result) if isinstance(result, str) else result
        except:
            # If not JSON, return the raw result
            return f"Found clinics near ({latitude}, {longitude}):\n\n{result}"
        
        # Format results nicely
        output = f"Found {len(clinics)} clinic(s) within {max_distance_km}km:\n\n"
        
        for idx, clinic in enumerate(clinics, 1):
            output += f"{'='*80}\n"
            output += f"{idx}. {clinic.get('clinic_name', 'N/A')}\n"
            output += f"   📍 Location: {clinic.get('location', 'N/A')}\n"
            output += f"   📏 Distance: {clinic.get('distance_km', 'N/A')} km away\n"
            output += f"   🏥 Category: {clinic.get('category', 'N/A')}\n"
            output += f"   🩺 Services: {clinic.get('services', 'N/A')}\n"
            output += f"   📞 Contact: {clinic.get('contacts', 'N/A')}\n"
            output += f"   🌐 Website: {clinic.get('website', 'N/A')}\n"
            output += f"   🗺️  Coordinates: {clinic.get('latitude', 'N/A')}, {clinic.get('longitude', 'N/A')}\n\n"
        
        return output
        
    except Exception as e:
        return f"Error searching for clinics: {str(e)}"


# Combine all tools
all_tools = sql_tools + [geocode_user_location, find_clinics_near_coordinates]


# Create the agent
system_prompt = """You are a helpful healthcare assistant that helps users find clinics in Kenya.

When a user asks to find clinics near a location, follow these steps:

1. **First, use the geocode_user_location tool** to convert the location name to coordinates
   - Example: If user says "find clinics near Westlands", use geocode_user_location("Westlands")

2. **Then, use the find_clinics_near_coordinates tool** with the coordinates you got
   - Use the latitude and longitude from step 1
   - Default to 20km radius unless user specifies otherwise

3. **Present the results clearly** to the user with all clinic details

Important guidelines:
- Always geocode the location FIRST before searching
- If geocoding fails, ask the user for a more specific location
- If no clinics are found, suggest trying a larger search radius
- Highlight clinics that match specific services the user mentioned (e.g., maternity, surgery)
- Be friendly and helpful in your responses

Example interaction:
User: "Find clinics near Karen"
You: 
1. Use geocode_user_location("Karen")
2. Get coordinates (e.g., -1.3333, 36.7000)
3. Use find_clinics_near_coordinates(-1.3333, 36.7000, 20)
4. Present the results to the user in a friendly way
"""

agent = create_react_agent(
    llm,
    tools=all_tools,
    state_modifier=system_prompt
)


# Example usage function
def find_clinics(user_query: str):
    """
    Main function to find clinics based on user query.
    
    Args:
        user_query: Natural language query (e.g., "Find clinics near Westlands")
        
    Returns:
        Agent response with clinic information
    """
    response = agent.invoke({
        "messages": [{"role": "user", "content": user_query}]
    })
    return response["messages"][-1].content


# Example usage
if __name__ == "__main__":
    print("=" * 100)
    print("🏥 CLINIC FINDER AGENT")
    print("=" * 100)
    print()
    
    # Test queries
    test_queries = [
        "Find clinics near Westlands, Nairobi",
    ]
    
    for query in test_queries:
        print(f"\n📋 Query: {query}")
        print("-" * 100)
        result = find_clinics(query)
        print(result)
        print("\n")