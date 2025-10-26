import pandas as pd
from sqlalchemy import create_engine
import numpy as np

# Step 1: Load Excel data
excel_path = "D:/RafikeyAIChatbot/app/bot/clinics_full_scraped.xlsx"

# Step 2: Connect to PostgreSQL
database_url = "postgresql+psycopg2://rafkey_db_3cj6_user:mi16PTKmSt9afoQILMSNfFIBPl27Kvtk@dpg-d0ec7uodl3ps73bjivm0-a.oregon-postgres.render.com/rafkey_db_3cj6"
table_name = 'clinics'

# Mapping from Excel columns to DB/model columns
COLUMN_MAP = {
    "Clinic Name": "clinic_name",
    "Services": "services",
    "Location": "location",
    "Phone": "phone",
    "Website": "website",
    "Latitude": "latitude",
    "Longitude": "longitude",
    "Google Link": "google_link",
    "source_co": "source_country",  # Excel column may be truncated, adjust as needed
    "Phone_Combined": "phone_combined",
    "Email_Combined": "email_combined"
}

# List of columns to keep in the correct order for the DB
DB_COLUMNS = [
    "clinic_name",
    "services",
    "location",
    "phone",
    "website",
    "latitude",
    "longitude",
    "google_link",
    "source_country",
    "phone_combined",
    "email_combined"
]

try:
    # Create engine with SSL requirement
    engine = create_engine(database_url + "?sslmode=require")
    
    # Test the connection
    with engine.connect() as conn:
        print("✅ Database connection successful!")
    
    # Load Excel file
    xls = pd.ExcelFile(excel_path)
    
    # Combine all sheets into one DataFrame
    combined_df = pd.DataFrame()
    for sheet in xls.sheet_names:
        df = xls.parse(sheet)
        df['source_country'] = sheet  # Use full sheet name for country
        combined_df = pd.concat([combined_df, df], ignore_index=True)
    
    print(f"📊 Loaded {len(combined_df)} records from {len(xls.sheet_names)} sheets")
    
    # Clean the data
    print("\n🧹 Cleaning data...")
    combined_df = combined_df.replace('#REF!', None)
    combined_df = combined_df.replace('#REF!', np.nan)
    if 'Website' in combined_df.columns:
        combined_df['Website'] = combined_df['Website'].replace('0', None)
        combined_df['Website'] = combined_df['Website'].replace(0, None)
    numeric_columns = ['Latitude', 'Longitude']
    for col in numeric_columns:
        if col in combined_df.columns:
            combined_df[col] = pd.to_numeric(combined_df[col], errors='coerce')
    # Combine phone columns
    phone_columns = [col for col in combined_df.columns if 'Phone' in col or 'phone' in col]
    if phone_columns:
        combined_df['Phone_Combined'] = combined_df[phone_columns].apply(
            lambda row: ', '.join([str(val) for val in row if pd.notna(val) and str(val) != '0']),
            axis=1
        )
        combined_df['Phone_Combined'] = combined_df['Phone_Combined'].replace('', None)
    # Combine email columns
    email_columns = [col for col in combined_df.columns if 'email' in col.lower() or 'Email' in col]
    if email_columns:
        combined_df['Email_Combined'] = combined_df[email_columns].apply(
            lambda row: ', '.join([str(val) for val in row if pd.notna(val) and str(val) != '0' and '@' in str(val)]),
            axis=1
        )
        combined_df['Email_Combined'] = combined_df['Email_Combined'].replace('', None)
    # Strip whitespace from all string columns
    for col in combined_df.select_dtypes(include=['object']).columns:
        combined_df[col] = combined_df[col].apply(lambda x: x.strip() if isinstance(x, str) else x)

    # Rename columns to match DB schema
    combined_df = combined_df.rename(columns=COLUMN_MAP)
    # Only keep columns that exist in the DB schema
    final_df = combined_df.reindex(columns=DB_COLUMNS)
    print("\n📋 Sample of cleaned and mapped data:")
    print(final_df.head())
    print("\n📊 Column names for DB insert:")
    print(final_df.columns.tolist())
    print(f"\n📈 Data types:")
    print(final_df.dtypes)

    # Step 4: Insert Data into PostgreSQL (append, do not replace table)
    print(f"\n💾 Inserting {len(final_df)} records into database...")
    final_df.to_sql(table_name, engine, if_exists='append', index=False)
    print(f"✅ Successfully inserted {len(final_df)} records into '{table_name}' table.")

except FileNotFoundError:
    print(f"❌ Error: Excel file not found at '{excel_path}'")
    print("Please check the file path and try again.")
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n🔍 Troubleshooting tips:")
    print("1. Verify database credentials are correct")
    print("2. Ensure database is running on Render.com")
    print("3. Check Excel file exists and is not corrupted")
    print("4. Verify Excel file is not open in another program")
    print("5. Check column names match expected format")