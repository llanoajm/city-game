# Bike Speed Integration for Three.js City Game

This project connects a stationary bike with a magnetometer to the Three.js City driving game, allowing real bike pedaling to control the car's speed.

## Setup Instructions

### 1. Raspberry Pi Setup

1. **SSH into your Raspberry Pi**
   ```bash
   ssh pi@your-pi-ip
   ```

2. **Navigate to the project directory**
   ```bash
   cd /path/to/Three.js-City-master/raspberry-pi
   ```

3. **Run the installation script**
   ```bash
   chmod +x install_websocket.sh
   ./install_websocket.sh
   ```

4. **Start the WebSocket server**
   ```bash
   python3 websocket_server.py
   ```

   The server will start on `ws://0.0.0.0:8765` and stream speed data to connected clients.

### 2. Three.js Game Setup

1. **Update the Pi's IP address** in `T3/js/BikeSpeedController.js`:
   ```javascript
   serverUrl: 'ws://YOUR_PI_IP:8765', // Change this to your Pi's IP
   ```

2. **Serve the Three.js game** using a local web server:
   ```bash
   # Using Python 3
   cd T3
   python3 -m http.server 8000
   
   # Or using Node.js
   npx http-server -p 8000
   ```

3. **Open the game** in your browser:
   ```
   http://localhost:8000
   ```

### 3. Hardware Setup

1. **Attach the magnetometer** to your stationary bike wheel
2. **Place a magnet** on the wheel that passes by the sensor
3. **Connect the magnetometer** to your Raspberry Pi via I2C

## How It Works

### Speed Detection
- The magnetometer detects magnetic field changes as the wheel rotates
- Peak detection algorithms identify wheel rotations
- Speed is calculated from the time between rotations
- Data is smoothed and filtered for accuracy

### Game Integration
- WebSocket server streams speed data from Pi to browser
- JavaScript client receives speed updates in real-time
- Car speed is mapped from bike speed (0-30 km/h) to game speed (0-100)
- Fallback to keyboard controls when bike is disconnected

### Features
- **Real-time speed display** in the game UI
- **Connection status indicator** (green=connected, red=disconnected)
- **Automatic reconnection** if connection is lost
- **Smooth speed transitions** for realistic car movement
- **Keyboard fallback** for testing without bike

## Troubleshooting

### Pi Connection Issues
- Check that the WebSocket server is running: `python3 websocket_server.py`
- Verify the IP address in `BikeSpeedController.js` matches your Pi's IP
- Check firewall settings on both Pi and computer
- Test connection with: `telnet YOUR_PI_IP 8765`

### Speed Reading Issues
- Ensure magnet is properly positioned near the sensor
- Check magnetometer calibration in the console output
- Adjust `wheel_diameter` parameter in `SpeedReader` class
- Verify I2C connection: `i2cdetect -y 1`

### Game Performance
- The game will automatically fall back to keyboard controls if bike is disconnected
- Speed updates are throttled to 10Hz to prevent performance issues
- Check browser console for connection status and error messages

## Configuration

### Speed Mapping
Adjust these values in `BikeSpeedController.js`:
```javascript
maxBikeSpeed: 30, // Expected maximum bike speed in km/h
maxGameSpeed: 100, // Maximum speed in game units
```

### Wheel Configuration
Adjust these values in `SpeedReader` class:
```python
wheel_diameter = 0.5  # Wheel diameter in meters
window_size = 50      # Data window for smoothing
```

## Files Overview

- `raspberry-pi/websocket_server.py` - WebSocket server that streams speed data
- `raspberry-pi/magplot.py` - Magnetometer reading and calibration
- `T3/js/BikeSpeedController.js` - WebSocket client for the game
- `T3/js/model/Car.js` - Modified car controller to use bike speed
- `T3/index.html` - Updated with speed display UI

## Demo Mode

For testing without a bike, you can:
1. Use keyboard controls (W/S for speed, A/D for steering)
2. Modify `BikeSpeedController.js` to simulate speed data
3. Use the pygame demo (`main.py`) to test speed detection separately 