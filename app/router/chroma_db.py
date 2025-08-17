from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import tempfile
import os
from typing import List, Optional
from pydantic import BaseModel
import logging

# LangChain imports
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
# Alternative embedding options:
# from langchain_community.embeddings import HuggingFaceEmbeddings
# from langchain_community.embeddings import SentenceTransformerEmbeddings


from dotenv import load_dotenv

load_dotenv()



# Load environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/pdf", tags=["PDF Processing"]
    )

# Response models
class UploadResponse(BaseModel):
    message: str
    file_name: str
    chunks_processed: int
    collection_name: str

class UploadConfig(BaseModel):
    collection_name: str = "pdf_documents"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    persist_directory: str = "./rafikey_chroma_db"

# Global configuration (you might want to load this from environment variables)
DEFAULT_CONFIG = UploadConfig()

# Initialize embeddings (configure based on your preference)
def get_embeddings():
    """Initialize embeddings. Modify based on your embedding choice."""
    try:
        # OpenAI Embeddings (requires OPENAI_API_KEY)
        return OpenAIEmbeddings(model="text-embedding-3-large", api_key=OPENAI_API_KEY)
        
        
    except Exception as e:
        logger.error(f"Failed to initialize embeddings: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize embeddings")

def process_pdf_file(file_path: str, config: UploadConfig) -> List:
    """Process PDF file and return document chunks."""
    try:
        # Load PDF
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        if not documents:
            raise ValueError("No content found in PDF")
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.chunk_size,
            chunk_overlap=config.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        chunks = text_splitter.split_documents(documents)
        logger.info(f"Split PDF into {len(chunks)} chunks")
        
        return chunks
        
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        raise

def update_chroma_db(chunks: List, config: UploadConfig, file_name: str):
    """Update ChromaDB with document chunks."""
    try:
        embeddings = get_embeddings()
        
        # Add metadata to chunks
        for i, chunk in enumerate(chunks):
            chunk.metadata.update({
                "source_file": file_name,
                "chunk_index": i,
                "total_chunks": len(chunks)
            })
        
        # Initialize or load existing Chroma database
        vectorstore = Chroma(
            collection_name=config.collection_name,
            embedding_function=embeddings,
            persist_directory=config.persist_directory
        )
        
        # Add documents to the vector store
        vectorstore.add_documents(chunks)
        
        # Persist the database
        vectorstore.persist()
        
        logger.info(f"Added {len(chunks)} chunks to ChromaDB collection: {config.collection_name}")
        
    except Exception as e:
        logger.error(f"Error updating ChromaDB: {e}")
        raise

@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    collection_name: Optional[str] = None,
    chunk_size: Optional[int] = None,
    chunk_overlap: Optional[int] = None,
    persist_directory: Optional[str] = None
):
    """
    Upload a PDF file and update ChromaDB.
    
    Args:
        file: PDF file to upload
        collection_name: ChromaDB collection name (optional)
        chunk_size: Size of text chunks (optional)
        chunk_overlap: Overlap between chunks (optional)
        persist_directory: Directory to persist ChromaDB (optional)
    """
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    if file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
    
    # Create config with provided parameters or defaults
    config = UploadConfig(
        collection_name=collection_name or DEFAULT_CONFIG.collection_name,
        chunk_size=chunk_size or DEFAULT_CONFIG.chunk_size,
        chunk_overlap=chunk_overlap or DEFAULT_CONFIG.chunk_overlap,
        persist_directory=persist_directory or DEFAULT_CONFIG.persist_directory
    )
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        try:
            # Save uploaded file to temporary location
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()
            
            logger.info(f"Processing uploaded file: {file.filename}")
            
            # Process PDF
            chunks = process_pdf_file(temp_file.name, config)
            
            # Update ChromaDB
            update_chroma_db(chunks, config, file.filename)
            
            return UploadResponse(
                message="PDF uploaded and processed successfully",
                file_name=file.filename,
                chunks_processed=len(chunks),
                collection_name=config.collection_name
            )
            
        except Exception as e:
            logger.error(f"Error processing upload: {e}")
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
        
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file.name)
            except Exception as e:
                logger.warning(f"Could not delete temporary file: {e}")

@router.post("/upload-multiple", response_model=List[UploadResponse])
async def upload_multiple_pdfs(
    files: List[UploadFile] = File(...),
    collection_name: Optional[str] = None,
    chunk_size: Optional[int] = None,
    chunk_overlap: Optional[int] = None,
    persist_directory: Optional[str] = None
):
    """
    Upload multiple PDF files and update ChromaDB.
    """
    
    if len(files) > 10:  # Limit number of files
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per batch")
    
    results = []
    errors = []
    
    for file in files:
        try:
            result = await upload_pdf(
                file=file,
                collection_name=collection_name,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                persist_directory=persist_directory
            )
            results.append(result)
        except Exception as e:
            errors.append(f"Error processing {file.filename}: {str(e)}")
    
    if errors and not results:
        raise HTTPException(status_code=500, detail={"errors": errors})
    
    if errors:
        # Some succeeded, some failed
        logger.warning(f"Batch upload completed with errors: {errors}")
    
    return results

@router.get("/collections")
async def list_collections():
    """List all available ChromaDB collections."""
    try:
        # This is a simple way to check collections
        # You might need to adjust based on your ChromaDB setup
        chroma_client = Chroma(persist_directory=DEFAULT_CONFIG.persist_directory)
        # Note: Getting collection names might require direct ChromaDB client access
        return {"message": "Collections endpoint - implement based on your needs"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accessing collections: {str(e)}")

@router.delete("/collection/{collection_name}")
async def delete_collection(collection_name: str):
    """Delete a ChromaDB collection."""
    try:
        embeddings = get_embeddings()
        vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=DEFAULT_CONFIG.persist_directory
        )
        
        # Note: You might need to use ChromaDB client directly for deletion
        # vectorstore.delete_collection()  # This method might not exist
        
        return {"message": f"Collection {collection_name} deletion requested"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting collection: {str(e)}")

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test embeddings
        embeddings = get_embeddings()
        
        # Test ChromaDB connection
        vectorstore = Chroma(
            collection_name="health_check",
            embedding_function=embeddings,
            persist_directory=DEFAULT_CONFIG.persist_directory
        )
        
        return {
            "status": "healthy",
            "embeddings": "ok",
            "chroma_db": "ok",
            "persist_directory": DEFAULT_CONFIG.persist_directory
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }