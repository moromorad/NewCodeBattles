import sys
import uvicorn
from src.main import socket_app

print("Attempting to import app...")
try:
    print("App imported successfully.")
except Exception as e:
    print(f"Error importing app: {e}")
    sys.exit(1)

if __name__ == "__main__":
    print("Starting Uvicorn programmatically...")
    uvicorn.run(socket_app, host="0.0.0.0", port=3000)
