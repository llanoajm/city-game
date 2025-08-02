/**
 * Simple Speed Display for Three.js City Game
 * Just displays bike speed without changing any controls
 */

T3.SimpleSpeedDisplay = {
    websocket: null,
    isConnected: false,
    currentSpeed: 0,
    
    // Configuration
    serverUrl: 'ws://192.168.1.41:8765', // Change this to your Pi's IP address
    
    init: function() {
        console.log('Initializing Simple Speed Display...');
        this.connect();
    },
    
    connect: function() {
        try {
            console.log('Connecting to bike speed server:', this.serverUrl);
            this.websocket = new WebSocket(this.serverUrl);
            
            this.websocket.onopen = function(event) {
                console.log('Connected to bike speed server!');
                T3.SimpleSpeedDisplay.isConnected = true;
                T3.SimpleSpeedDisplay.updateDisplay();
            };
            
            this.websocket.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    T3.SimpleSpeedDisplay.currentSpeed = data.speed;
                    T3.SimpleSpeedDisplay.updateDisplay();
                    console.log('Received speed:', data.speed, 'km/h');
                } catch (e) {
                    console.error('Error parsing speed data:', e);
                }
            };
            
            this.websocket.onclose = function(event) {
                console.log('Disconnected from bike speed server');
                T3.SimpleSpeedDisplay.isConnected = false;
                T3.SimpleSpeedDisplay.updateDisplay();
            };
            
            this.websocket.onerror = function(error) {
                console.error('WebSocket error:', error);
                T3.SimpleSpeedDisplay.isConnected = false;
                T3.SimpleSpeedDisplay.updateDisplay();
            };
            
        } catch (e) {
            console.error('Error connecting to bike speed server:', e);
        }
    },
    
    updateDisplay: function() {
        var speedElement = document.getElementById('bike-speed-value');
        var statusElement = document.getElementById('bike-status');
        var controlModeElement = document.getElementById('control-mode');
        
        if (speedElement && statusElement && controlModeElement) {
            if (this.isConnected) {
                speedElement.textContent = this.currentSpeed.toFixed(1);
                statusElement.textContent = 'Connected';
                statusElement.style.color = '#00ff00';
                
                // Show control mode based on speed
                if (this.currentSpeed > 0.1) {
                    controlModeElement.textContent = 'Bike Control';
                    controlModeElement.style.color = '#00ff00';
                } else {
                    controlModeElement.textContent = 'Gamepad/Keyboard';
                    controlModeElement.style.color = '#ffff00';
                }
            } else {
                speedElement.textContent = '--';
                statusElement.textContent = 'Disconnected';
                statusElement.style.color = '#ff0000';
                controlModeElement.textContent = 'Gamepad/Keyboard';
                controlModeElement.style.color = '#ffffff';
            }
        }
    },
    
    disconnect: function() {
        if (this.websocket) {
            this.websocket.close();
        }
    }
}; 