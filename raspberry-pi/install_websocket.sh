#!/bin/bash

echo "Installing WebSocket server dependencies for bike speed controller..."

# Update package list
sudo apt-get update

# Install Python dependencies
echo "Installing Python packages..."
pip3 install websockets

# Install system dependencies for the magnetometer
echo "Installing system dependencies..."
sudo apt-get install -y python3-pip python3-dev

# Install Adafruit CircuitPython libraries
echo "Installing Adafruit libraries..."
pip3 install adafruit-circuitpython-lis2mdl

# Make the WebSocket server executable
chmod +x websocket_server.py

echo "Installation complete!"
echo ""
echo "To start the WebSocket server, run:"
echo "python3 websocket_server.py"
echo ""
echo "The server will start on ws://0.0.0.0:8765"
echo "Make sure to update the IP address in BikeSpeedController.js to match your Pi's IP" 