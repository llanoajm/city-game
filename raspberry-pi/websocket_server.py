#!/usr/bin/python3
import asyncio
import websockets
import json
import time
from main import SpeedReader  # Import the existing SpeedReader from main.py

# Global speed reader
speed_reader = SpeedReader()

async def websocket_handler(websocket, path):
    """Handle WebSocket connections and stream speed data"""
    print(f"Client connected from {websocket.remote_address}")
    
    try:
        while True:
            # Get current speed using the existing SpeedReader
            speed = speed_reader.get_speed()
            
            # Create data packet
            data = {
                "speed": speed,
                "timestamp": time.time(),
                "unit": "km/h"
            }
            
            # Send to client
            await websocket.send(json.dumps(data))
            
            # Wait 100ms before next reading
            await asyncio.sleep(0.1)
            
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    except Exception as e:
        print(f"Error in websocket handler: {e}")

async def main():
    """Start the WebSocket server"""
    print("Starting WebSocket server on ws://0.0.0.0:8765")
    print("Speed data will be streamed to connected clients")
    
    async def handle_client(websocket):
        await websocket_handler(websocket, None)
    
    server = await websockets.serve(
        handle_client, 
        "0.0.0.0", 
        8765
    )
    
    print("Server started. Waiting for connections...")
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}") 