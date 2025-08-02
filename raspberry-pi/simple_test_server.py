#!/usr/bin/python3
import asyncio
import websockets
import json
import time

async def simple_handler(websocket, path):
    """Simple test handler"""
    print(f"Client connected from {websocket.remote_address}")
    
    try:
        count = 0
        while True:
            # Send test data
            data = {
                "speed": count * 2.5,  # Fake speed data
                "timestamp": time.time(),
                "unit": "km/h"
            }
            
            await websocket.send(json.dumps(data))
            print(f"Sent test data: {data['speed']} km/h")
            
            count += 1
            await asyncio.sleep(1)
            
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    except Exception as e:
        print(f"Error: {e}")

async def main():
    """Start simple test server"""
    print("Starting SIMPLE test WebSocket server on ws://0.0.0.0:8765")
    
    server = await websockets.serve(
        simple_handler, 
        "0.0.0.0", 
        8765
    )
    
    print("Simple server started. Waiting for connections...")
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}") 