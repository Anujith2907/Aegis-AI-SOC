import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cyberguard-db")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/cyberguard")
DB_NAME = MONGODB_URI.split("/")[-1] if "/" in MONGODB_URI else "cyberguard"

# Fallback in-memory database representation in case MongoDB is offline during presentation
class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = {}

    async def insert_one(self, document):
        if "_id" not in document:
            document["_id"] = str(len(self.data) + 1)
        self.data[document["_id"]] = document
        return type('obj', (object,), {'inserted_id': document["_id"]})()

    async def find_one(self, filter):
        for k, v in self.data.items():
            match = True
            for fk, fv in filter.items():
                if v.get(fk) != fv:
                    match = False
                    break
            if match:
                return v
        return None

    def find(self, filter=None, limit=None):
        res = []
        filter = filter or {}
        for k, v in self.data.items():
            match = True
            for fk, fv in filter.items():
                if v.get(fk) != fv:
                    match = False
                    break
            if match:
                res.append(v)
        
        # Simple limit mock
        if limit:
            res = res[:limit]
            
        class AsyncCursor:
            def __init__(self, items):
                self.items = items
            def sort(self, *args, **kwargs):
                return self
            def skip(self, *args, **kwargs):
                return self
            def limit(self, *args, **kwargs):
                return self
            async def to_list(self, length=100):
                return self.items[:length]
            def __aiter__(self):
                self.iter_items = iter(self.items)
                return self
            async def __anext__(self):
                try:
                    return next(self.iter_items)
                except StopIteration:
                    raise StopAsyncIteration
        
        return AsyncCursor(res)

    async def update_one(self, filter, update, upsert=False):
        doc = await self.find_one(filter)
        if not doc:
            if upsert:
                # Insert
                doc = {"_id": filter.get("_id", str(len(self.data) + 1))}
                for k, v in filter.items():
                    doc[k] = v
                self.data[doc["_id"]] = doc
            else:
                return type('obj', (object,), {'modified_count': 0})()
        
        if "$set" in update:
            for k, v in update["$set"].items():
                doc[k] = v
        self.data[doc["_id"]] = doc
        return type('obj', (object,), {'modified_count': 1})()

    async def delete_one(self, filter):
        doc = await self.find_one(filter)
        if doc:
            del self.data[doc["_id"]]
            return type('obj', (object,), {'deleted_count': 1})()
        return type('obj', (object,), {'deleted_count': 0})()

    async def delete_many(self, filter):
        docs = []
        for k, v in list(self.data.items()):
            match = True
            for fk, fv in filter.items():
                if v.get(fk) != fv:
                    match = False
                    break
            if match:
                del self.data[k]
        return type('obj', (object,), {'deleted_count': len(docs)})()

class MockDatabase:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

# Global DB client variables
client = None
db = None
is_mock = False

try:
    logger.info(f"Connecting to MongoDB at: {MONGODB_URI}")
    # Try connecting with a 3-second timeout
    client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
    # Check connection
    # Note: motor client is lazy, to test connection we fetch list of database names
    db = client[DB_NAME]
    is_mock = False
except Exception as e:
    logger.warning(f"Failed to connect to real MongoDB ({e}). Falling back to in-memory database for demo!")
    db = MockDatabase()
    is_mock = True

def get_db():
    return db

async def verify_db_connection():
    global db, is_mock, client
    if is_mock:
        return False
    try:
        await client.server_info()
        logger.info("MongoDB connection verified successfully.")
        return True
    except Exception as e:
        logger.warning(f"MongoDB connection check failed: {e}. Switching to in-memory mock database.")
        db = MockDatabase()
        is_mock = True
        return False
