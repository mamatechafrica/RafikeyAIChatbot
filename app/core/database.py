from typing import Annotated
from fastapi import Depends
from sqlmodel import Field, Session, SQLModel, create_engine, select



POSTSTGRES_URL = "postgresql://rafikey_db_user:ZCDE9o3TJQTcw8NMSbBa6EJ1uTltWObl@dpg-d41h4djipnbc73fcobt0-a.oregon-postgres.render.com/rafikey_db"


engine = create_engine(POSTSTGRES_URL)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session   


SessionDep = Annotated[Session, Depends(get_session)]