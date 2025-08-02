#!/usr/bin/python3
import asyncio
import websockets
import json

async def test_connection():
    uri = "ws://192.168.1.41:8765"
    print(f"Testing connection to {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")
            
            # Listen for messages
            count = 0
            while count < 10:  # Listen for 10 messages
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    data = json.loads(message)
                    print(f"Received: Speed = {data['speed']:.1f} km/h")
                    count += 1
                except asyncio.TimeoutError:
                    print("❌ Timeout waiting for message")
                    break
                    
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection()) 