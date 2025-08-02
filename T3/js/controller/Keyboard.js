/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/14/13
 * Time: 6:39 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    T3.controller.Keyboard = {

        keys: [],

        init: function (options) {
            var me = this,
                defaults = {},
                i;

            for (i = 0; i < 256; i += 1) {
                me.keys[i] = false;
            }

            document.addEventListener( 'keydown', me.onKeyDown(), false );
            document.addEventListener( 'keyup', me.onKeyUp(), false );

            // Initialize PlayStation controller support
            me.initGamepad();

            $.extend(true, defaults, options);
        },

        initGamepad: function () {
            var me = this;
            
            // Gamepad state
            me.gamepad = {
                connected: false,
                controller: null,
                steering: 0,    // Left stick X-axis for steering
                throttle: 0,    // R2 trigger for acceleration
                brake: 0        // L2 trigger for braking
            };

            // Listen for gamepad connections
            window.addEventListener('gamepadconnected', function(e) {
                console.log('Gamepad connected:', e.gamepad);
                me.gamepad.connected = true;
                me.gamepad.controller = e.gamepad;
                
                // Show connection notification
                me.showControllerStatus('PlayStation Controller Connected!', true);
            });

            window.addEventListener('gamepaddisconnected', function(e) {
                console.log('Gamepad disconnected:', e.gamepad);
                me.gamepad.connected = false;
                me.gamepad.controller = null;
                
                // Show disconnection notification
                me.showControllerStatus('PlayStation Controller Disconnected!', false);
            });

            // Start gamepad polling
            me.pollGamepad();
        },

        pollGamepad: function () {
            var me = this;
            
            function poll() {
                // Check for any connected gamepads
                var gamepads = navigator.getGamepads();
                var controller = null;
                
                // Find the first connected gamepad
                for (var i = 0; i < gamepads.length; i++) {
                    if (gamepads[i] && gamepads[i].connected) {
                        controller = gamepads[i];
                        break;
                    }
                }
                
                if (controller && !me.gamepad.connected) {
                    // New controller connected
                    console.log('Gamepad detected:', controller);
                    me.gamepad.connected = true;
                    me.gamepad.controller = controller;
                } else if (!controller && me.gamepad.connected) {
                    // Controller disconnected
                    console.log('Gamepad disconnected');
                    me.gamepad.connected = false;
                    me.gamepad.controller = null;
                }
                
                if (me.gamepad.connected && controller) {
                    // Update gamepad state
                    me.gamepad.controller = controller;
                    
                    // PS5 Controller mappings:
                    // Left stick X-axis (0) for steering
                    // Right stick X-axis (2) for camera horizontal
                    // Right stick Y-axis (3) for camera vertical
                    // R2 trigger (7) for acceleration
                    // L2 trigger (6) for braking
                    
                    me.gamepad.steering = controller.axes[0] || 0;
                    me.gamepad.cameraHorizontal = controller.axes[2] || 0;
                    me.gamepad.cameraVertical = controller.axes[3] || 0;
                    me.gamepad.throttle = controller.buttons[7] ? controller.buttons[7].value : 0;
                    me.gamepad.brake = controller.buttons[6] ? controller.buttons[6].value : 0;
                    
                    // Debug: Log controller inputs
                    // Removed for production
                    
                    // Map to keyboard controls for compatibility
                    var throttleActive = me.gamepad.throttle > 0.2;      // R2 for throttle
                    var brakeActive = me.gamepad.brake > 0.2;            // L2 for brake
                    var leftActive = me.gamepad.steering < -0.4;         // Left stick for steering - increased threshold
                    var rightActive = me.gamepad.steering > 0.4;         // Left stick for steering - increased threshold
                    var cameraUpActive = me.gamepad.cameraVertical > 0.2;    // Right stick Y-axis for camera up
                    var cameraDownActive = me.gamepad.cameraVertical < -0.2;  // Right stick Y-axis for camera down
                    var cameraLeftActive = me.gamepad.cameraHorizontal < -0.2; // Right stick X-axis for camera left
                    var cameraRightActive = me.gamepad.cameraHorizontal > 0.2; // Right stick X-axis for camera right
                    
                    // Set keyboard state directly
                    me.keys['W'.charCodeAt(0)] = throttleActive;
                    me.keys['S'.charCodeAt(0)] = brakeActive;
                    me.keys['A'.charCodeAt(0)] = leftActive;
                    me.keys['D'.charCodeAt(0)] = rightActive;
                    me.keys['Q'.charCodeAt(0)] = cameraUpActive;     // Q for camera up
                    me.keys['E'.charCodeAt(0)] = cameraDownActive;   // E for camera down
                    me.keys['Z'.charCodeAt(0)] = cameraLeftActive;   // Z for camera left
                    me.keys['C'.charCodeAt(0)] = cameraRightActive;  // C for camera right
                    
                    // Debug: Check if keyboard state is being set correctly
                    // Removed for production
                    
                    // Debug: Show active controls
                    // Removed for production
                }
                
                requestAnimationFrame(poll);
            }
            
            poll();
        },

        initGamepadGUI: function (gui) {
            var me = this;
            
            // Ensure gamepad object exists
            if (!me.gamepad) {
                me.gamepad = {
                    connected: false,
                    controller: null,
                    steering: 0,
                    cameraHorizontal: 0,
                    cameraVertical: 0,
                    throttle: 0,
                    brake: 0
                };
            }
            
            var folder = gui.addFolder('PlayStation Controller');
            
            folder.add(me.gamepad, 'connected')
                .name('Connected')
                .listen();
            
            folder.add(me.gamepad, 'steering', -1, 1)
                .name('Steering')
                .listen();
            
            folder.add(me.gamepad, 'cameraHorizontal', -1, 1)
                .name('Camera Horizontal')
                .listen();
            
            folder.add(me.gamepad, 'cameraVertical', -1, 1)
                .name('Camera Vertical')
                .listen();
            
            folder.add(me.gamepad, 'throttle', 0, 1)
                .name('Throttle (R2)')
                .listen();
            
            folder.add(me.gamepad, 'brake', 0, 1)
                .name('Brake (L2)')
                .listen();
        },

        onKeyDown: function () {
            var me = this;
            return function (event) {
                // Only set keyboard keys if no controller is connected
                if (!me.gamepad || !me.gamepad.connected) {
                    me.keys[event.keyCode] = true;
                }
            }
        },

        onKeyUp: function () {
            var me = this;
            return function (event) {
                // Only clear keyboard keys if no controller is connected
                if (!me.gamepad || !me.gamepad.connected) {
                    me.keys[event.keyCode] = false;
                }
            }
        },

        query: function (key) {
            return this.keys[key.charCodeAt(0)];
        },

        set: function (key, value) {
            this.keys[key.charCodeAt(0)] = value;
        }
    };

    // alias
    T3.Keyboard = T3.controller.Keyboard;
}());