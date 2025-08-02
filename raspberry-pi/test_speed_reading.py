#!/usr/bin/python3
"""
Simple test script to verify speed reading works on the Pi
Run this to test your magnetometer setup before starting the WebSocket server
"""

from main import SpeedReader
import time

def test_speed_reading():
    print("Testing bike speed reading...")
    print("Make sure your bike wheel is spinning with the magnet!")
    print("Press Ctrl+C to stop")
    print("-" * 40)
    
    # Initialize speed reader
    speed_reader = SpeedReader()
    
    try:
        while True:
            # Get current speed
            speed = speed_reader.get_speed()
            
            # Display speed
            print(f"Speed: {speed:.1f} km/h", end='\r')
            
            # Wait a bit
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("\nTest stopped by user")
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    test_speed_reading() 