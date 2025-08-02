/**
 * Bike Speed Controller for Three.js City Game
 * Connects to Raspberry Pi WebSocket server to get real bike speed data
 */

T3.BikeSpeedController = {
    websocket: null,
    isConnected: false,
    currentSpeed: 0,
    maxBikeSpeed: 30, // Expected maximum bike speed in km/h
    maxGameSpeed: 100, // Maximum speed in game units
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    
    // Configuration
    serverUrl: 'ws://192.168.1.100:8765', // Change this to your Pi's IP
    reconnectInterval: 3000, // 3 seconds
    
    init: function() {
        console.log('Initializing Bike Speed Controller...');
        this.connect();
    },
    
    connect: function() {
        try {
            console.log('Connecting to bike speed server:', this.serverUrl);
            this.websocket = new WebSocket(this.serverUrl);
            
            this.websocket.onopen = function(event) {
                console.log('Connected to bike speed server!');
                T3.BikeSpeedController.isConnected = true;
                T3.BikeSpeedController.reconnectAttempts = 0;
                T3.BikeSpeedController.updateSpeedDisplay();
            };
            
            this.websocket.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    T3.BikeSpeedController.currentSpeed = data.speed;
                    T3.BikeSpeedController.updateSpeedDisplay();
                    console.log('Received speed:', data.speed, 'km/h');
                } catch (e) {
                    console.error('Error parsing speed data:', e);
                }
            };
            
            this.websocket.onclose = function(event) {
                console.log('Disconnected from bike speed server');
                T3.BikeSpeedController.isConnected = false;
                T3.BikeSpeedController.updateSpeedDisplay();
                T3.BikeSpeedController.attemptReconnect();
            };
            
            this.websocket.onerror = function(error) {
                console.error('WebSocket error:', error);
                T3.BikeSpeedController.isConnected = false;
            };
            
        } catch (e) {
            console.error('Error connecting to bike speed server:', e);
            this.attemptReconnect();
        }
    },
    
    attemptReconnect: function() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('Max reconnection attempts reached. Falling back to keyboard controls.');
        }
    },
    
    getSpeedInput: function() {
        // If connected to bike, use real speed data
        if (this.isConnected && this.currentSpeed > 0) {
            // Convert bike speed to game speed
            const normalizedSpeed = Math.min(this.currentSpeed / this.maxBikeSpeed, 1.0);
            return normalizedSpeed * this.maxGameSpeed;
        }
        
        // Fallback to keyboard input
        return null;
    },
    
    getSpeedDisplay: function() {
        if (this.isConnected) {
            return this.currentSpeed.toFixed(1);
        }
        return 'Disconnected';
    },
    
    updateSpeedDisplay: function() {
        var speedElement = document.getElementById('speed-value');
        var statusElement = document.getElementById('connection-status');
        
        if (speedElement && statusElement) {
            speedElement.textContent = this.getSpeedDisplay();
            statusElement.textContent = this.isConnected ? 'Connected' : 'Disconnected';
            statusElement.style.color = this.isConnected ? '#00ff00' : '#ff0000';
        }
    },
    
    isBikeConnected: function() {
        return this.isConnected;
    },
    
    disconnect: function() {
        if (this.websocket) {
            this.websocket.close();
        }
    }
}; 