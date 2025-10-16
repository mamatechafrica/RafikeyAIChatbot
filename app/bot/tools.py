from langchain.tools.retriever import create_retriever_tool
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import os 
from langchain_core.tools import tool
from langchain_core.tools import tool
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_openai import ChatOpenAI
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

load_dotenv()

# Database connection
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



GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

embeddings = GoogleGenerativeAIEmbeddings(
    model='models/text-embedding-004', 
    google_api_key=GOOGLE_API_KEY,
)

vectostore = Chroma(
    embedding_function=embeddings,
    persist_directory='app/bot/rafikey_chroma_db'
)

retriever = vectostore.as_retriever()

retriever_tool = create_retriever_tool(
    retriever=retriever,
    name="rafike_retriever",
    description="Search for accurate, evidence-based information about Sexual and Reproductive Health and Rights (SRHR) topics. Use this tool to find up-to-date information on contraception, STIs, reproductive anatomy, pregnancy, menstruation, sexual consent, gender identity, reproductive rights, youth sexual education, and maternal health. This tool helps provide culturally sensitive and scientifically accurate responses to user queries about SRHR topics in English, Swahili, or Sheng.",
)

#============= Tool for Hospital Referrals =============

# Initialize geocoder
geolocator = Nominatim(user_agent="clinic_finder_kenya_app")


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



# List of all tools
tools = [
    retriever_tool,
    geocode_user_location,
    find_clinics_near_coordinates
] + sql_tools


if __name__ == "__main__":
    for tool in sql_tools:
        print(f"{tool.name}: {tool.description}\n")
