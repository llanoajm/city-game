#!/bin/bash

echo "Setting up Bike Speed Display for Three.js Game"
echo "=============================================="

# Check if we're on the Pi
if [ -f /etc/rpi-issue ]; then
    echo "Detected Raspberry Pi - setting up WebSocket server..."
    
    # Install websockets library
    echo "Installing websockets library..."
    pip3 install websockets
    
    # Make scripts executable
    chmod +x websocket_server.py
    
    echo ""
    echo "Setup complete! To start the WebSocket server, run:"
    echo "python3 websocket_server.py"
    echo ""
    echo "The server will stream real bike speed data to the game."
    
else
    echo "Not on Raspberry Pi - this script is for Pi setup only."
    echo "On your computer, just serve the Three.js game:"
    echo "cd T3 && python3 -m http.server 8000"
fi 