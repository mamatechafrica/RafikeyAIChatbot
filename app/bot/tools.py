from langchain.tools.retriever import create_retriever_tool
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import os 
from langchain_core.tools import tool
from pydantic import BaseModel, Field 
from sqlalchemy import create_engine, text
from typing import Annotated, List, Dict, Any, Optional
import pandas as pd
from langchain_core.tools import tool
import requests
from bs4 import BeautifulSoup

# Database connection
DATABASE_URL = "postgresql+psycopg2://rafkey_db_3cj6_user:mi16PTKmSt9afoQILMSNfFIBPl27Kvtk@dpg-d0ec7uodl3ps73bjivm0-a.oregon-postgres.render.com/rafkey_db_3cj6?sslmode=require"

load_dotenv()

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
def get_db_engine():
    """Get the database engine."""
    return create_engine(DATABASE_URL)

@tool
def search_hospital_referrals(
    location: Annotated[Optional[str], "Location to search - can be county, constituency, sub_county, or ward name"] = None,
    county: Annotated[Optional[str], "County name to search for"] = None,
    sub_county: Annotated[Optional[str], "Sub county name to search for"] = None,
    constituency: Annotated[Optional[str], "Constituency name to search for"] = None,
    ward: Annotated[Optional[str], "Ward name to search for"] = None,
    facility_name: Annotated[Optional[str], "Hospital/facility name to search for"] = None,
    facility_type: Annotated[Optional[str], "Type of healthcare facility (e.g., hospital, clinic, dispensary)"] = None,
    keph_level: Annotated[Optional[str], "KEPH level (1-6) for facility classification"] = None,
    owner: Annotated[Optional[str], "Facility owner (e.g., government, private, NGO)"] = None,
    limit: Annotated[int, "Maximum number of results to return"] = 10
) -> str:
    """
    Search for healthcare facilities in Kenya from the hospital referrals directory.
    
    This tool searches based on:
    - Location: County, Constituency, Sub County, or Ward (now supports explicit narrowing by each level)
    - Facility Name: Hospital or clinic name
    - Facility Type: Type of healthcare facility
    - KEPH Level: Kenya Essential Package for Health level (1-6)
    - Owner: Public, private, or NGO facilities

    You can specify any combination of county, sub_county, constituency, and ward for precise location-based filtering. If multiple are provided, the search will be narrowed to the most specific level.

    Args:
        location: (Optional) General location name (for backward compatibility)
        county: (Optional) County name
        sub_county: (Optional) Sub county name
        constituency: (Optional) Constituency name
        ward: (Optional) Ward name
        facility_name: Name of the healthcare facility
        facility_type: Type of facility (hospital, clinic, dispensary, etc.)
        keph_level: KEPH level classification (1-6)
        owner: Facility ownership type
        limit: Maximum number of results (default 10)

    Returns:
        Formatted list of healthcare facilities with details
    """
    try:
        engine = get_db_engine()
        
        with engine.connect() as conn:
            # Build dynamic query
            query_parts = ["SELECT * FROM hospital_referrals WHERE 1=1"]
            params = {}
            
            # Location search (county, constituency, sub_county, ward)
            # Hierarchical narrowing: if ward is provided, use it; else constituency, sub_county, county; else fallback to generic location
            if ward:
                query_parts.append('AND LOWER(COALESCE("Ward", \'\')) LIKE LOWER(:ward)')
                params['ward'] = f'%{ward}%'
            elif constituency:
                query_parts.append('AND LOWER(COALESCE("Constituency", \'\')) LIKE LOWER(:constituency)')
                params['constituency'] = f'%{constituency}%'
            elif sub_county:
                query_parts.append('AND LOWER(COALESCE("Sub county", \'\')) LIKE LOWER(:sub_county)')
                params['sub_county'] = f'%{sub_county}%'
            elif county:
                query_parts.append('AND LOWER(COALESCE("County", \'\')) LIKE LOWER(:county)')
                params['county'] = f'%{county}%'
            elif location:
                query_parts.append("""
                    AND (LOWER(COALESCE("County", '')) LIKE LOWER(:location)
                    OR LOWER(COALESCE("Constituency", '')) LIKE LOWER(:location)
                    OR LOWER(COALESCE("Sub county", '')) LIKE LOWER(:location)
                    OR LOWER(COALESCE("Ward", '')) LIKE LOWER(:location))
                """)
                params['location'] = f'%{location}%'
            
            # Facility name search
            if facility_name:
                query_parts.append("""
                    AND LOWER(COALESCE("Name", '')) LIKE LOWER(:facility_name)
                """)
                params['facility_name'] = f'%{facility_name}%'
            
            # Facility type search
            if facility_type:
                query_parts.append("""
                    AND LOWER(COALESCE("Facility type", '')) LIKE LOWER(:facility_type)
                """)
                params['facility_type'] = f'%{facility_type}%'
            
            # KEPH level search
            if keph_level:
                query_parts.append("""
                    AND LOWER(COALESCE("Keph level", '')) LIKE LOWER(:keph_level)
                """)
                params['keph_level'] = f'%{keph_level}%'
            
            # Owner search
            if owner:
                query_parts.append("""
                    AND LOWER(COALESCE("Owner", '')) LIKE LOWER(:owner)
                """)
                params['owner'] = f'%{owner}%'
            
            query_parts.append(f"LIMIT {limit}")
            
            final_query = " ".join(query_parts)
            
            result = conn.execute(text(final_query), params)
            df = pd.DataFrame(result.fetchall(), columns=result.keys())
            
            if df.empty:
                return "No healthcare facilities found matching your criteria. Try broadening your search terms or check spelling."
            
            # Format results
            formatted_results = []
            for idx, row in df.iterrows():
                facility_info = []
                
                # Facility name
                if pd.notna(row.get('Name')) and str(row.get('Name')).strip():
                    facility_info.append(f"🏥 **{row['Name']}**")
                else:
                    facility_info.append(f"🏥 **Healthcare Facility #{idx + 1}**")
                
                # Code
                if pd.notna(row.get('Code')) and str(row.get('Code')).strip():
                    facility_info.append(f"🆔 Code: {row['Code']}")
                
                # Location hierarchy
                location_parts = []
                for loc_field in ['County', 'Constituency', 'Sub county', 'Ward']:
                    if pd.notna(row.get(loc_field)) and str(row.get(loc_field)).strip():
                        location_parts.append(f"{loc_field}: {row[loc_field]}")
                
                if location_parts:
                    facility_info.append(f"📍 Location: {' | '.join(location_parts)}")
                
                # Facility details
                if pd.notna(row.get('Facility type')) and str(row.get('Facility type')).strip():
                    facility_info.append(f"🏢 Type: {row['Facility type']}")
                
                if pd.notna(row.get('Keph level')) and str(row.get('Keph level')).strip():
                    facility_info.append(f"📊 KEPH Level: {row['Keph level']}")
                
                if pd.notna(row.get('Owner')) and str(row.get('Owner')).strip():
                    facility_info.append(f"👤 Owner: {row['Owner']}")
                
                # Capacity
                capacity_info = []
                if pd.notna(row.get('Beds')) and str(row.get('Beds')).strip() and str(row.get('Beds')) != '0':
                    capacity_info.append(f"Beds: {row['Beds']}")
                if pd.notna(row.get('Cots')) and str(row.get('Cots')).strip() and str(row.get('Cots')) != '0':
                    capacity_info.append(f"Cots: {row['Cots']}")
                
                if capacity_info:
                    facility_info.append(f"🛏️ Capacity: {' | '.join(capacity_info)}")
                
                # Operation status
                if pd.notna(row.get('Operation status')) and str(row.get('Operation status')).strip():
                    status_emoji = "✅" if "operational" in str(row.get('Operation status')).lower() else "⚠️"
                    facility_info.append(f"{status_emoji} Status: {row['Operation status']}")
                
                formatted_results.append("\n".join(facility_info))
            
            result_header = f"Found {len(df)} healthcare facility/facilities:\n\n"
            return result_header + "\n\n" + "="*50 + "\n\n".join([""] + formatted_results)
            
    except Exception as e:
        return f"Error searching hospital database: {str(e)}. Please try again or contact support if the issue persists."

@tool
def get_healthcare_statistics() -> str:
    """
    Get statistics about healthcare facilities in the database.
    
    Returns:
        Statistics including facility counts by county, type, ownership, and KEPH levels
    """
    try:
        engine = get_db_engine()
        
        with engine.connect() as conn:
            # Total facilities
            total_result = conn.execute(text('SELECT COUNT(*) as total FROM hospital_referrals'))
            total_facilities = total_result.fetchone()[0]
            
            # By county (top 10)
            county_result = conn.execute(text('''
                SELECT "County", COUNT(*) as count 
                FROM hospital_referrals 
                WHERE "County" IS NOT NULL AND "County" != ''
                GROUP BY "County" 
                ORDER BY count DESC 
                LIMIT 10
            '''))
            county_df = pd.DataFrame(county_result.fetchall(), columns=['county', 'count'])
            
            # By facility type
            type_result = conn.execute(text('''
                SELECT "Facility type", COUNT(*) as count 
                FROM hospital_referrals 
                WHERE "Facility type" IS NOT NULL AND "Facility type" != ''
                GROUP BY "Facility type" 
                ORDER BY count DESC
            '''))
            type_df = pd.DataFrame(type_result.fetchall(), columns=['type', 'count'])
            
            # By owner
            owner_result = conn.execute(text('''
                SELECT "Owner", COUNT(*) as count 
                FROM hospital_referrals 
                WHERE "Owner" IS NOT NULL AND "Owner" != ''
                GROUP BY "Owner" 
                ORDER BY count DESC
            '''))
            owner_df = pd.DataFrame(owner_result.fetchall(), columns=['owner', 'count'])
            
            # By KEPH level
            keph_result = conn.execute(text('''
                SELECT "Keph level", COUNT(*) as count 
                FROM hospital_referrals 
                WHERE "Keph level" IS NOT NULL AND "Keph level" != ''
                GROUP BY "Keph level" 
                ORDER BY "Keph level"
            '''))
            keph_df = pd.DataFrame(keph_result.fetchall(), columns=['keph_level', 'count'])
            
            # Format response
            stats = [
                f"📊 **Healthcare Facilities Database Statistics**",
                f"",
                f"🏥 Total Healthcare Facilities: {total_facilities}",
                f"",
                f"🌍 **Top 10 Counties by Facility Count:**"
            ]
            
            for _, row in county_df.iterrows():
                stats.append(f"   • {row['county']}: {row['count']} facilities")
            
            stats.extend([
                f"",
                f"🏢 **Facility Types:**"
            ])
            
            for _, row in type_df.iterrows():
                stats.append(f"   • {row['type']}: {row['count']} facilities")
            
            stats.extend([
                f"",
                f"👤 **Ownership:**"
            ])
            
            for _, row in owner_df.iterrows():
                stats.append(f"   • {row['owner']}: {row['count']} facilities")
            
            stats.extend([
                f"",
                f"📊 **KEPH Levels:**"
            ])
            
            for _, row in keph_df.iterrows():
                stats.append(f"   • Level {row['keph_level']}: {row['count']} facilities")
            
            return "\n".join(stats)
            
    except Exception as e:
        return f"Error getting healthcare statistics: {str(e)}"

@tool
def search_facilities_by_county(
    county: Annotated[str, "County name to search for facilities"],
    limit: Annotated[int, "Maximum number of results to return"] = 20
) -> str:
    """
    Get all healthcare facilities in a specific county.
    
    Args:
        county: Name of the county
        limit: Maximum number of results
    
    Returns:
        List of all healthcare facilities in the specified county
    """
    return search_hospital_referrals.invoke({
        "county": county,
        "limit": limit
    })

# List of all tools
tools = [
    retriever_tool,
    search_hospital_referrals,
    get_healthcare_statistics,
    search_facilities_by_county
]


BASE_URL = "https://lovemattersafrica.com/wp-json/wp/v2/clinics"


@tool("get_clinics_by_location", return_direct=True)
def get_clinics_by_location(location: str) -> str:
    """
    Get clinics or hospitals based on a given location name.
    Returns a simple text summary of clinics in that area and their services.
    """
    try:
        # Search clinics using the WordPress API
        response = requests.get(BASE_URL, params={"search": location})
        response.raise_for_status()
        data = response.json()

        if not data:
            return f"No clinics found in {location}."

        results = []
        for clinic in data:
            name = clinic["title"]["rendered"]
            link = clinic["link"]
            services = clinic.get("clinic_services", [])
            results.append(f"🏥 {name}\n🔗 {link}\n🩺 Services IDs: {services}\n")

        return "\n".join(results[:5])  # Limit to first 5 results
    except Exception as e:
        return f"Error fetching clinics: {e}"




def test_tools():
    print("Testing LangGraph Hospital Tools...")
    
    # Test 1: Get statistics
    print("\n" + "="*50)
    print("1. Getting healthcare statistics:")
    print("="*50)
    result = get_healthcare_statistics.invoke({})
    print(result)
    
    # Test 2: Search by location (Kiambu)
    print("\n" + "="*50)
    print("2. Searching by location (Kiambu):")
    print("="*50)
    result = search_hospital_referrals.invoke({
        "location": "Kiambu",
        "limit": 5
    })
    print(result)
    
    # Test 3: Search by facility type
    print("\n" + "="*50)
    print("3. Searching by facility type (Hospital):")
    print("="*50)
    result = search_hospital_referrals.invoke({
        "facility_type": "Hospital",
        "limit": 5
    })
    print(result)
    
    # Test 4: Search by county
    print("\n" + "="*50)
    print("4. Searching facilities in Nairobi County:")
    print("="*50)
    result = search_facilities_by_county.invoke({
        "county": "Nairobi",
        "limit": 5
    })
    print(result)

if __name__ == "__main__":
    # Use it directly
  print(get_clinics_by_location("Nairobi"))   
