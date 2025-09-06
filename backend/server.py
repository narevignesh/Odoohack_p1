from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime
from passlib.context import CryptContext
from jose import JWTError, jwt
import bcrypt
from contextlib import asynccontextmanager

ROOT_DIR = Path(__file__).parent

# Try to load .env file, but don't fail if it doesn't exist or has encoding issues
try:
    load_dotenv(ROOT_DIR / '.env')
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    print("Using default environment variables")

# MongoDB connection with defaults
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'ecofinds')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    client.close()

# Create the main app without a prefix
app = FastAPI(title="EcoFinds API", version="1.0.0", lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

# Database Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password_hash: str
    display_name: str = Field(..., min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatar: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username must be 3-50 characters")
    email: EmailStr = Field(..., description="Valid email address required")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    display_name: str = Field(..., min_length=1, max_length=100, description="Display name is required")
    bio: Optional[str] = Field(None, max_length=500, description="Bio can be up to 500 characters")
    location: Optional[str] = Field(None, max_length=100, description="Location can be up to 100 characters")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number can be up to 20 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    display_name: str
    bio: Optional[str]
    avatar: Optional[str]
    location: Optional[str]
    phone: Optional[str]
    is_verified: bool
    created_at: datetime

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    price: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=50)
    images: List[str] = Field(default_factory=list)
    condition: str = Field(..., pattern="^(new|like_new|good|fair|poor)$")
    seller_id: str
    seller_name: str
    seller_email: Optional[str] = None
    seller_phone: Optional[str] = None
    seller_location: Optional[str] = None
    location: Optional[str] = None
    is_available: bool = Field(default=True)
    views: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    price: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=50)
    images: List[str] = Field(default_factory=list)
    condition: str = Field(..., pattern="^(new|like_new|good|fair|poor)$")
    location: Optional[str] = None

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=1, max_length=50)
    icon: str
    product_count: int = Field(default=0)
    color: str = Field(default="bg-green-100 text-green-600")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    icon: str
    color: str = Field(default="bg-green-100 text-green-600")

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return User(**user)

# Initialize default categories
async def initialize_categories():
    existing_categories = await db.categories.count_documents({})
    if existing_categories == 0:
        default_categories = [
            {"id": "all", "name": "All Categories", "icon": "Grid3X3", "product_count": 0, "color": "bg-gray-100 text-gray-600"},
            {"id": "clothing", "name": "Clothing", "icon": "Shirt", "product_count": 0, "color": "bg-blue-100 text-blue-600"},
            {"id": "electronics", "name": "Electronics", "icon": "Smartphone", "product_count": 0, "color": "bg-purple-100 text-purple-600"},
            {"id": "furniture", "name": "Furniture", "icon": "Home", "product_count": 0, "color": "bg-orange-100 text-orange-600"},
            {"id": "home", "name": "Home & Garden", "icon": "TreePine", "product_count": 0, "color": "bg-green-100 text-green-600"},
            {"id": "sports", "name": "Sports & Fitness", "icon": "Dumbbell", "product_count": 0, "color": "bg-red-100 text-red-600"},
            {"id": "books", "name": "Books", "icon": "Book", "product_count": 0, "color": "bg-yellow-100 text-yellow-600"},
            {"id": "other", "name": "Other", "icon": "Package", "product_count": 0, "color": "bg-gray-100 text-gray-600"}
        ]
        await db.categories.insert_many(default_categories)

# API Routes
@api_router.get("/")
async def root():
    return {"message": "EcoFinds API is running!"}

# Authentication Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "Email already registered",
                    "field": "email",
                    "message": "This email address is already in use. Please use a different email or try logging in."
                }
            )
        
        existing_username = await db.users.find_one({"username": user_data.username})
        if existing_username:
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "Username already taken",
                    "field": "username", 
                    "message": "This username is already taken. Please choose a different username."
                }
            )
        
        # Create new user
        hashed_password = hash_password(user_data.password)
        user_dict = user_data.dict()
        user_dict.pop("password")
        user_dict["password_hash"] = hashed_password
        
        user = User(**user_dict)
        await db.users.insert_one(user.dict())
        
        # Return user without password
        return UserResponse(**user.dict())
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Registration failed",
                "message": "An unexpected error occurred. Please try again."
            }
        )

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse(**user)}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.dict())

# Categories Routes
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    await initialize_categories()
    categories = await db.categories.find().sort("name", 1).to_list(100)
    return [Category(**cat) for cat in categories]

@api_router.get("/categories/{category_id}/count")
async def get_category_count(category_id: str):
    if category_id == "all":
        count = await db.products.count_documents({"is_available": True})
    else:
        count = await db.products.count_documents({"category": category_id, "is_available": True})
    return {"count": count}

# Products Routes
@api_router.get("/products", response_model=List[Product])
async def get_products(skip: int = 0, limit: int = 20, category: str = None, search: str = None):
    query = {"is_available": True}
    
    if category and category != "all":
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/featured", response_model=List[Product])
async def get_featured_products(limit: int = 8):
    products = await db.products.find({"is_available": True}).limit(limit).sort("created_at", -1).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Increment view count
    await db.products.update_one({"id": product_id}, {"$inc": {"views": 1}})
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    # Get seller info
    seller_info = await db.users.find_one({"id": current_user.id})
    if not seller_info:
        raise HTTPException(status_code=404, detail="User not found")
    
    product_dict = product_data.dict()
    product_dict["seller_id"] = current_user.id
    product_dict["seller_name"] = seller_info["display_name"]
    product_dict["seller_email"] = seller_info["email"]
    product_dict["seller_phone"] = seller_info.get("phone")
    product_dict["seller_location"] = seller_info.get("location")
    
    product = Product(**product_dict)
    await db.products.insert_one(product.dict())
    
    # Update category count
    await db.categories.update_one(
        {"id": product.category},
        {"$inc": {"product_count": 1}}
    )
    
    return product

@api_router.get("/users/{user_id}/products", response_model=List[Product])
async def get_user_products(user_id: str):
    products = await db.products.find({"seller_id": user_id}).sort("created_at", -1).to_list(1000)
    return [Product(**product) for product in products]

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    # Check if product exists and belongs to current user
    existing_product = await db.products.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if existing_product["seller_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")
    
    # Update product data
    update_data = product_data.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the product
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    # Get updated product
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    # Check if product exists and belongs to current user
    existing_product = await db.products.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if existing_product["seller_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")
    
    # Delete the product
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update category count
    await db.categories.update_one(
        {"id": existing_product["category"]},
        {"$inc": {"product_count": -1}}
    )
    
    return {"message": "Product deleted successfully"}

# User Routes
@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@api_router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_data: dict, current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user_data["updated_at"] = datetime.utcnow()
    await db.users.update_one({"id": user_id}, {"$set": user_data})
    
    updated_user = await db.users.find_one({"id": user_id})
    return UserResponse(**updated_user)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

