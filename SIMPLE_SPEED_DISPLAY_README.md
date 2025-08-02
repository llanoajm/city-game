# Real Bike Speed Display

This connects your actual Raspberry Pi magnetometer to display real bike speed in the Three.js game.

## Setup Instructions

### 1. Raspberry Pi Setup

1. **SSH into your Pi:**
   ```bash
   ssh pi@your-pi-ip
   ```

2. **Navigate to the project:**
   ```bash
   cd /path/to/Three.js-City-master/raspberry-pi
   ```

3. **Run the setup script:**
   ```bash
   chmod +x setup_bike_display.sh
   ./setup_bike_display.sh
   ```

4. **Test the speed reading:**
   ```bash
   python3 test_speed_reading.py
   ```
   Make sure your bike wheel is spinning with the magnet!

5. **Start the WebSocket server:**
   ```bash
   python3 websocket_server.py
   ```

### 2. Three.js Game Setup

1. **Update the Pi's IP address** in `T3/js/SimpleSpeedDisplay.js`:
   ```javascript
   serverUrl: 'ws://YOUR_PI_IP:8765', // Change to your Pi's IP
   ```

2. **Serve the Three.js game:**
   ```bash
   cd T3
   python3 -m http.server 8000
   ```

3. **Open the game** in your browser:
   ```
   http://localhost:8000
   ```

## What You'll See

- **Real-time speed display** in the top-left corner
- **Connection status** (green=connected, red=disconnected)
- **Your existing R2/L2 controls still work** - no changes to gamepad logic
- **Real bike speed** from your magnetometer

## Troubleshooting

### Pi Connection Issues
- Check that `python3 websocket_server.py` is running on the Pi
- Verify the IP address in `SimpleSpeedDisplay.js` matches your Pi's IP
- Test with `python3 test_speed_reading.py` to verify speed detection works

### Speed Reading Issues
- Make sure the magnet is properly positioned near the sensor
- Check that the wheel is spinning and the magnet is passing by the sensor
- Verify I2C connection: `i2cdetect -y 1`

### Game Connection Issues
- Check browser console for WebSocket connection errors
- Make sure the game is served over HTTP (not file://)
- Verify firewall settings on both Pi and computer

## Files Overview

- `raspberry-pi/websocket_server.py` - WebSocket server using your SpeedReader
- `raspberry-pi/test_speed_reading.py` - Test script for speed detection
- `T3/js/SimpleSpeedDisplay.js` - WebSocket client for the game
- `T3/index.html` - Speed display UI

The gamepad controls (R2/L2) remain completely unchanged - this just adds a speed display! 