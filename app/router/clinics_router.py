from fastapi import APIRouter, HTTPException, Query
from app.core.database import SessionDep
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models import Clinic
from sqlmodel import select


class ClinicCreate(BaseModel):
    clinic_name: str = Field(..., description="Clinic name is required")
    services: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    google_link: Optional[str] = None
    source_country: Optional[str] = None
    phone_combined: Optional[str] = None
    email_combined: Optional[str] = None


class ClinicUpdate(BaseModel):
    clinic_name: Optional[str] = None
    services: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    google_link: Optional[str] = None
    source_country: Optional[str] = None
    phone_combined: Optional[str] = None
    email_combined: Optional[str] = None


class ClinicResponse(BaseModel):
    id: int
    clinic_name: Optional[str]
    services: Optional[str]
    location: Optional[str]
    phone: Optional[str]
    website: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    google_link: Optional[str]
    source_country: Optional[str]
    phone_combined: Optional[str]
    email_combined: Optional[str]


router = APIRouter(
    prefix="/clinics",
    tags=["Clinics"],
)


# Create - Add new clinics 
@router.post("/", response_model=ClinicResponse, status_code=201)
async def create_clinic(clinic: ClinicCreate, session: SessionDep):
    """Create a new clinic"""
    try:
        db_clinic = Clinic(
            **clinic.model_dump()
        )
        session.add(db_clinic)
        session.commit()
        session.refresh(db_clinic)
        return db_clinic
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# READ - Get all clinics with pagination
@router.get("/clinics", response_model=List[ClinicResponse])
async def get_clinics(
    session: SessionDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    country: Optional[str] = Query(None, description="Filter by source country")
):
    """Get all clinics with optional filtering and pagination"""
    try:
        query = select(Clinic)
        
        if country:
            query = query.where(Clinic.source_country == country)
        
        query = query.offset(skip).limit(limit)
        clinics = session.exec(query).all()
        return clinics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching clinics: {str(e)}")
    

# UPDATE - Update clinic by ID
@router.put("/clinics/{clinic_id}", response_model=ClinicResponse)
async def update_clinic(clinic_id: int, clinic_update: ClinicUpdate, session: SessionDep):
    """Update an existing clinic"""
    try:
        db_clinic = session.get(Clinic, clinic_id)
        if not db_clinic:
            raise HTTPException(status_code=404, detail=f"Clinic with ID {clinic_id} not found")
        
        # Update only provided fields
        clinic_data = clinic_update.model_dump(exclude_unset=True)
        for key, value in clinic_data.items():
            setattr(db_clinic, key, value)
        
        session.add(db_clinic)
        session.commit()
        session.refresh(db_clinic)
        return db_clinic
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating clinic: {str(e)}")


# PATCH - Partial update clinic by ID
@router.patch("/clinics/{clinic_id}", response_model=ClinicResponse)
async def patch_clinic(clinic_id: int, clinic_update: ClinicUpdate, session: SessionDep):
    """Partially update an existing clinic"""
    try:
        db_clinic = session.get(Clinic, clinic_id)
        if not db_clinic:
            raise HTTPException(status_code=404, detail=f"Clinic with ID {clinic_id} not found")
        
        # Update only provided fields
        clinic_data = clinic_update.model_dump(exclude_unset=True)
        if not clinic_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        for key, value in clinic_data.items():
            setattr(db_clinic, key, value)
        
        session.add(db_clinic)
        session.commit()
        session.refresh(db_clinic)
        return db_clinic
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating clinic: {str(e)}")
    

# DELETE - Delete clinic by ID
@router.delete("/clinics/{clinic_id}")
async def delete_clinic(clinic_id: int, session: SessionDep):
    """Delete a clinic by ID"""
    try:
        clinic = session.get(Clinic, clinic_id)
        if not clinic:
            raise HTTPException(status_code=404, detail=f"Clinic with ID {clinic_id} not found")
        
        session.delete(clinic)
        session.commit()
        return {"message": f"Clinic with ID {clinic_id} successfully deleted"}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting clinic: {str(e)}")
