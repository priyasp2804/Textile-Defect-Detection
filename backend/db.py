# db.py
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "textile_db")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

print("✅ MongoDB (Motor) connected successfully!")
