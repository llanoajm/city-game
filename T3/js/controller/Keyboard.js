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
                    me.showControllerStatus('PlayStation Controller Connected!', true);
                } else if (!controller && me.gamepad.connected) {
                    // Controller disconnected
                    console.log('Gamepad disconnected');
                    me.gamepad.connected = false;
                    me.gamepad.controller = null;
                    me.showControllerStatus('PlayStation Controller Disconnected!', false);
                }
                
                if (me.gamepad.connected && controller) {
                    // Update gamepad state
                    me.gamepad.controller = controller;
                    
                    // PS5 Controller mappings:
                    // Left stick X-axis (0) for steering
                    // R2 trigger (7) for acceleration  
                    // L2 trigger (6) for braking
                    
                    me.gamepad.steering = controller.axes[0] || 0;
                    me.gamepad.throttle = controller.buttons[7] ? controller.buttons[7].value : 0;
                    me.gamepad.brake = controller.buttons[6] ? controller.buttons[6].value : 0;
                    
                    // Debug: Log controller inputs
                    if (Math.abs(me.gamepad.steering) > 0.1 || me.gamepad.throttle > 0.1 || me.gamepad.brake > 0.1) {
                        console.log('Controller inputs:', {
                            steering: me.gamepad.steering,
                            throttle: me.gamepad.throttle,
                            brake: me.gamepad.brake
                        });
                    }
                    
                    // Map to keyboard controls for compatibility
                    var throttleActive = me.gamepad.throttle > 0.05;
                    var brakeActive = me.gamepad.brake > 0.05;
                    var leftActive = me.gamepad.steering < -0.05;
                    var rightActive = me.gamepad.steering > 0.05;
                    
                    // Set keyboard state directly
                    me.keys['W'.charCodeAt(0)] = throttleActive;
                    me.keys['S'.charCodeAt(0)] = brakeActive;
                    me.keys['A'.charCodeAt(0)] = leftActive;
                    me.keys['D'.charCodeAt(0)] = rightActive;
                    
                    // Debug: Check if keyboard state is being set correctly
                    if (throttleActive || brakeActive || leftActive || rightActive) {
                        console.log('Keyboard state set:', {
                            W: me.query('W'),
                            S: me.query('S'),
                            A: me.query('A'),
                            D: me.query('D'),
                            throttleActive: throttleActive,
                            brakeActive: brakeActive,
                            leftActive: leftActive,
                            rightActive: rightActive
                        });
                    }
                    
                    // Debug: Show active controls
                    if (me.gamepad.throttle > 0.05 || me.gamepad.brake > 0.05 || Math.abs(me.gamepad.steering) > 0.05) {
                        console.log('Active controls:', {
                            forward: me.gamepad.throttle > 0.05,
                            backward: me.gamepad.brake > 0.05,
                            left: me.gamepad.steering < -0.05,
                            right: me.gamepad.steering > 0.05,
                            throttle: me.gamepad.throttle,
                            brake: me.gamepad.brake,
                            steering: me.gamepad.steering
                        });
                        
                        // Show visual indicator
                        me.showControllerInputs(me.gamepad.throttle, me.gamepad.brake, me.gamepad.steering);
                    } else {
                        me.hideControllerInputs();
                    }
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
            
            folder.add(me.gamepad, 'throttle', 0, 1)
                .name('Throttle (R2)')
                .listen();
            
            folder.add(me.gamepad, 'brake', 0, 1)
                .name('Brake (L2)')
                .listen();
        },

        showControllerStatus: function (message, connected) {
            // Create or update status display
            var statusDiv = document.getElementById('controller-status');
            if (!statusDiv) {
                statusDiv = document.createElement('div');
                statusDiv.id = 'controller-status';
                statusDiv.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 10px 15px;
                    border-radius: 5px;
                    color: white;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                    z-index: 1000;
                    transition: opacity 0.5s;
                `;
                document.body.appendChild(statusDiv);
            }
            
            statusDiv.textContent = message;
            statusDiv.style.backgroundColor = connected ? '#4CAF50' : '#f44336';
            statusDiv.style.opacity = '1';
            
            // Hide after 3 seconds
            setTimeout(function() {
                statusDiv.style.opacity = '0';
            }, 3000);
        },

        showControllerInputs: function (throttle, brake, steering) {
            var inputDiv = document.getElementById('controller-inputs');
            if (!inputDiv) {
                inputDiv = document.createElement('div');
                inputDiv.id = 'controller-inputs';
                inputDiv.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    padding: 15px;
                    border-radius: 8px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    z-index: 1000;
                `;
                document.body.appendChild(inputDiv);
            }
            
            inputDiv.innerHTML = `
                <div style="margin-bottom: 5px;"><strong>Controller Inputs:</strong></div>
                <div>Throttle (R2): ${(throttle * 100).toFixed(0)}%</div>
                <div>Brake (L2): ${(brake * 100).toFixed(0)}%</div>
                <div>Steering: ${(steering * 100).toFixed(0)}%</div>
            `;
            inputDiv.style.display = 'block';
        },

        hideControllerInputs: function () {
            var inputDiv = document.getElementById('controller-inputs');
            if (inputDiv) {
                inputDiv.style.display = 'none';
            }
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