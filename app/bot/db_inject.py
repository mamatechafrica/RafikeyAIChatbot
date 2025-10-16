import pandas as pd 
from sqlalchemy import create_engine

# Step 1: Load Excel data
excel_path = "D:/RafikeyAIChatbot/app/bot/kenya_clinics.xlsx"

# Step 2: Connect to PostgreSQL using the full database URL
# Note: SQLAlchemy requires 'postgresql+psycopg2://' instead of 'postgresql://'
database_url = "postgresql+psycopg2://rafkey_db_3cj6_user:mi16PTKmSt9afoQILMSNfFIBPl27Kvtk@dpg-d0ec7uodl3ps73bjivm0-a.oregon-postgres.render.com/rafkey_db_3cj6"
table_name = 'clinics'

try:
    # Create engine with SSL requirement (important for Render.com)
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
    print("Sample data:")
    print(combined_df.head())
    
    # Step 3: Insert Data into PostgreSQL
    combined_df.to_sql(table_name, engine, if_exists='replace', index=False)
    
    print(f"✅ Successfully inserted {len(combined_df)} records into '{table_name}' table.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n🔍 Please check:")
    print("1. Database credentials are correct")
    print("2. Database is running on Render.com")
    print("3. Excel file exists at the specified path")
