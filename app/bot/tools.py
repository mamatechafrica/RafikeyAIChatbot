from langchain.tools.retriever import create_retriever_tool
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import os 
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
    Uses the latitude and longitude columns in the clinics table.

    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        radius_km: Search radius in kilometers (default: 20km)

    Returns:
        String with results of nearby clinics
    """
    # Calculate distance using Haversine formula on latitude/longitude columns
    query = f"""
    SELECT
        clinic_name,
        services,
        location,
        phone,
        website,
        latitude,
        longitude,
        google_link,
        source_country,
        phone_combined,
        email_combined,
        (6371 * acos(
            cos(radians({latitude})) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians({longitude})) +
            sin(radians({latitude})) *
            sin(radians(latitude))
        )) AS distance_km
    FROM clinics
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    AND (6371 * acos(
            cos(radians({latitude})) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians({longitude})) +
            sin(radians({latitude})) *
            sin(radians(latitude))
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
tools = [
    retriever_tool,
    geocode_location,
    find_nearby_clinics
] 