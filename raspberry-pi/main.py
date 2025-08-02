import asyncio
import pygame as pg
import sys, platform, math, random
import numpy as np
from collections import deque
from scipy.signal import find_peaks, savgol_filter
from magplot import MagnetometerReader
import time

class SpeedReader:
    def __init__(self, wheel_diameter=0.5, window_size=50):
        self.wheel_diameter = wheel_diameter
        self.wheel_circumference = np.pi * wheel_diameter
        self.window_size = window_size
        self.mag_sensor = MagnetometerReader()
        
        # Data storage
        self.timestamps = deque(maxlen=window_size)
        self.z_data = deque(maxlen=window_size)
        self.speed_history = deque(maxlen=5)
        
        # Initialize with calibration
        print("Calibrating magnetometer...")
        self.mag_sensor.calibrate()
        cal_data = [self.mag_sensor.read_calibrated_data()['z'] for _ in range(50)]
        self.noise_floor = np.std(cal_data) * 2
        self.min_prominence = self.noise_floor * 2
        
    def get_speed(self):
        data = self.mag_sensor.read_calibrated_data()
        current_time = time.monotonic()
        
        self.timestamps.append(current_time)
        self.z_data.append(data['z'])
        
        if len(self.z_data) > 20:
            z_list = list(self.z_data)
            z_smooth = savgol_filter(z_list, window_length=11, polyorder=3)
            
            recent_rms = np.sqrt(np.mean(np.array(z_list[-20:])**2))
            
            if recent_rms > self.noise_floor * 2:
                peaks, _ = find_peaks(z_smooth, 
                                    height=self.noise_floor,
                                    prominence=self.min_prominence,
                                    distance=10)
                
                if len(peaks) >= 2:
                    latest_peaks = peaks[-2:]
                    period = self.timestamps[latest_peaks[1]] - self.timestamps[latest_peaks[0]]
                    speed_mps = self.wheel_circumference / period if period > 0 else 0
                    speed_kmh = speed_mps * 3.6
                    
                    self.speed_history.append(speed_kmh)
                    return np.mean(self.speed_history)
        
        return 0.0

class Tree():
    def __init__(self, distance):
        self.x = distance + random.randint(10, 20) + 0.5
        self.y = random.randint(500, 1500)*random.choice([-1,1])

def calc_y(x):
    return 200*math.sin(x/17) + 170*math.sin(x/8)

def calc_z(x):
    return 200+80*math.sin(x/13)-120*math.sin(x/7)

def render_element(screen, sprite, width, height, scale, x, car, y, z_buffer):
    y = calc_y(x) - y
    z = calc_z(x) - car.z

    vertical = int(60+160*scale + z*scale)
    if vertical >= 1 and vertical < 180 and z_buffer[vertical-1] > 1/scale -10:
        horizontal = 160-(160 - y)*scale +  car.angle*(vertical-150)

        scaled_sprite = pg.transform.scale(sprite, (width, height))
        screen.blit(scaled_sprite, (horizontal, vertical-height+1))

class Car():
    def __init__(self, distance):
        self.x = distance + random.randint(90, 110)

class Player():
    def __init__(self, speed_reader):
        self.x = 0
        self.y = 300
        self.z = 0
        self.angle = 0
        self.velocity = 0
        self.acceleration = 0
        self.speed_reader = speed_reader
        self.max_game_speed = 20  # Maximum speed in game units
        self.max_bike_speed = 30  # Expected maximum bike speed in km/h
        self.current_bike_speed = 0

    def controls(self, delta):
        pressed_keys = pg.key.get_pressed()
        
        # Decay acceleration
        self.acceleration += -0.5*self.acceleration * delta
        
        # Get bike speed and update display value
        self.current_bike_speed = self.speed_reader.get_speed()
        target_velocity = (self.current_bike_speed / self.max_bike_speed) * self.max_game_speed
        
        # Allow keyboard override for testing
        if pressed_keys[pg.K_w] or pressed_keys[pg.K_UP]:
            target_velocity = self.max_game_speed
        elif pressed_keys[pg.K_s] or pressed_keys[pg.K_DOWN]:
            target_velocity = -self.max_game_speed/2
            
        # Smooth transition to target velocity
        speed_diff = target_velocity - self.velocity
        self.acceleration += speed_diff * delta * 2
        
        # Steering
        if pressed_keys[pg.K_a] or pressed_keys[pg.K_LEFT]:
            self.angle -= delta*self.velocity/10
        elif pressed_keys[pg.K_d] or pressed_keys[pg.K_RIGHT]:
            self.angle += delta*self.velocity/10
        
        # Apply limits
        self.velocity = max(-10, min(self.velocity + self.acceleration * delta, 20))
        self.angle = max(-0.8, min(0.8, self.angle))
        
        # Update position
        self.x += self.velocity*delta*math.cos(self.angle)
        self.y += self.velocity*math.sin(self.angle)*delta*100

async def main():
    screen_size = [320, 180]

    if sys.platform == "emscripten":
        platform.window.canvas.style.imageRendering = "pixelated"
        screen = pg.display.set_mode(screen_size)
    else:
        screen = pg.display.set_mode(screen_size, pg.SCALED)

    clock = pg.time.Clock()
    clock.tick(); pg.time.wait(16)
    
    # Load game assets
    road_texture = pg.image.load("assets/road.png").convert()
    mountains_texture = pg.image.load("assets/mountains.png").convert()
    car_sprite = pg.image.load("assets/car.png").convert()
    car_sprite.set_colorkey((255,0,255))
    car_sprite2 = pg.image.load("assets/car2.png").convert()
    car_sprite2.set_colorkey((255,0,255))
    tree_sprite = pg.image.load("assets/tree.png").convert()
    tree_sprite.set_colorkey((255,0,255))

    # Initialize speed reader and player
    speed_reader = SpeedReader()
    car = Player(speed_reader)
    cars = [Car(-50), Car(-23), Car(7)]
    trees = [Tree(-67), Tree(-55), Tree(-43), Tree(-33), Tree(-25), Tree(-13), Tree(-3)]

    # Initialize font for speed display
    font = pg.font.Font(None, 24)

    running = 1
    total_time = 0

    while running:
        delta = clock.tick()/1000 + 0.00001
        total_time += delta
        car.controls(delta)

        for event in pg.event.get():
            if event.type == pg.QUIT: running = 0

        screen.blit(mountains_texture, (-65- car.angle*82,0))
        vertical, draw_distance = 180, 1
        car.z = calc_z(car.x)
        z_buffer = [999 for element in range(180)]
        
        while draw_distance < 120:
            last_vertical = vertical
            while vertical >= last_vertical and draw_distance < 120:
                draw_distance += draw_distance/150
                x = car.x + draw_distance
                scale = 1/draw_distance
                z = calc_z(x) - car.z
                vertical = int(60+160*scale + z*scale)

            if draw_distance < 120:
                z_buffer[int(vertical)] = draw_distance
                road_slice = road_texture.subsurface((0, 10*x%360,320, 1))
                color = (int(50-draw_distance/3),int(130-draw_distance), int(50-z/20+30*math.sin(x)))
                pg.draw.rect(screen, color, (0, vertical, 320, 1))
                render_element(screen, road_slice, 500*scale, 1, scale, x, car, car.y, z_buffer)
        
        for index in reversed(range(len(trees)-1)):
            scale = max(0.0001, 1/(trees[index].x - car.x))
            render_element(screen, tree_sprite, 200*scale, 300*scale, scale, trees[index].x, car, trees[index].y+car.y, z_buffer)
        
        if trees[0].x < car.x+1:
            trees.pop(0)
            trees.append(Tree(trees[-1].x))

        for index in reversed(range(len(cars)-1)):
            scale = max(0.0001, 1/(cars[index].x - car.x))
            render_element(screen, car_sprite2, 100*scale, 80*scale, scale, cars[index].x, car, -70+car.y, z_buffer)
            cars[index].x -= 10*delta
        
        if cars[0].x < car.x+1:
            cars.pop(0)
            cars.append(Car(car.x))

        screen.blit(car_sprite, (120, 120+math.sin(total_time*car.velocity)))
        
        # Display speed
        speed_text = font.render(f"Speed: {car.current_bike_speed:.1f} km/h", True, (255, 255, 255))
        screen.blit(speed_text, (10, 10))

        if abs(car.y - calc_y(car.x+2) -100) > 280 and car.velocity > 5:
            car.velocity += -car.velocity*delta
            car.acceleration += -car.acceleration*delta
            pg.draw.circle(screen, (255,0,0), (300, 170), 3)
            
        pg.display.update()
        await asyncio.sleep(0)

if __name__ == "__main__":
    pg.init()
    asyncio.run(main())
    pg.quit()
