import pandas as pd
from sqlalchemy import create_engine
import numpy as np

# Step 1: Load Excel data
excel_path = "D:/RafikeyAIChatbot/app/bot/clinics_full_scraped.xlsx"

# Step 2: Connect to PostgreSQL
database_url = "postgresql+psycopg2://rafkey_db_3cj6_user:mi16PTKmSt9afoQILMSNfFIBPl27Kvtk@dpg-d0ec7uodl3ps73bjivm0-a.oregon-postgres.render.com/rafkey_db_3cj6"
table_name = 'clinics'

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
        df['source_country'] = sheet 
        combined_df = pd.concat([combined_df, df], ignore_index=True)
    
    print(f"📊 Loaded {len(combined_df)} records from {len(xls.sheet_names)} sheets")
    
    # Step 3: Clean the data
    print("\n🧹 Cleaning data...")
    
    # Replace "#REF!" errors with None
    combined_df = combined_df.replace('#REF!', None)
    combined_df = combined_df.replace('#REF!', np.nan)
    
    # Handle "0" values in Website column (assuming "0" means no website)
    if 'Website' in combined_df.columns:
        combined_df['Website'] = combined_df['Website'].replace('0', None)
        combined_df['Website'] = combined_df['Website'].replace(0, None)
    
    # Convert numeric columns properly
    numeric_columns = ['Latitude', 'Longitude']
    for col in numeric_columns:
        if col in combined_df.columns:
            # Replace "0" strings with NaN for lat/long if they seem invalid
            combined_df[col] = pd.to_numeric(combined_df[col], errors='coerce')
    
    # Clean phone numbers - combine multiple phone columns if they exist
    phone_columns = [col for col in combined_df.columns if 'Phone' in col or 'phone' in col]
    if phone_columns:
        # Combine all phone numbers into one column, separated by comma
        combined_df['Phone_Combined'] = combined_df[phone_columns].apply(
            lambda row: ', '.join([str(val) for val in row if pd.notna(val) and str(val) != '0']),
            axis=1
        )
        combined_df['Phone_Combined'] = combined_df['Phone_Combined'].replace('', None)
    
    # Clean email/website - handle multiple columns
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
    
    # Display sample of cleaned data
    print("\n📋 Sample of cleaned data:")
    print(combined_df.head())
    print("\n📊 Column names:")
    print(combined_df.columns.tolist())
    print(f"\n📈 Data types:")
    print(combined_df.dtypes)
    
    # Step 4: Insert Data into PostgreSQL
    print(f"\n💾 Inserting {len(combined_df)} records into database...")
    combined_df.to_sql(table_name, engine, if_exists='replace', index=False)
    
    print(f"✅ Successfully inserted {len(combined_df)} records into '{table_name}' table.")
    
    # Show some statistics
    print(f"\n📊 Summary Statistics:")
    print(f"   Total records: {len(combined_df)}")
    print(f"   Sheets processed: {len(xls.sheet_names)}")
    if 'Latitude' in combined_df.columns:
        valid_coords = combined_df[['Latitude', 'Longitude']].notna().all(axis=1).sum()
        print(f"   Records with valid coordinates: {valid_coords}")
    
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