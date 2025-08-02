#!/usr/bin/python3
import asyncio
import websockets
import json
import time
import random

async def websocket_handler(websocket, path):
    """Handle WebSocket connections and stream test speed data"""
    print(f"Client connected from {websocket.remote_address}")
    
    try:
        while True:
            # Generate test speed data (0-30 km/h)
            speed = random.uniform(0, 30)
            
            # Create data packet
            data = {
                "speed": speed,
                "timestamp": time.time(),
                "unit": "km/h"
            }
            
            # Send to client
            await websocket.send(json.dumps(data))
            print(f"Sent speed: {speed:.1f} km/h")
            
            # Wait 1 second before next reading
            await asyncio.sleep(1)
            
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    except Exception as e:
        print(f"Error in websocket handler: {e}")

async def main():
    """Start the WebSocket server"""
    print("Starting TEST WebSocket server on ws://0.0.0.0:8765")
    print("Generating random speed data for testing...")
    
    server = await websockets.serve(
        websocket_handler, 
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