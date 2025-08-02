#!/usr/bin/python3
import time
import board
import busio
import adafruit_lis2mdl

class MagnetometerReader:
    def __init__(self):
        # Initialize I2C bus
        self.i2c = busio.I2C(board.SCL, board.SDA)
        
        # Initialize the LIS2MDL sensor
        self.sensor = adafruit_lis2mdl.LIS2MDL(self.i2c)
        
        # Storage for calibration data
        self.offset = {'x': 0, 'y': 0, 'z': 0}
        self.scale = {'x': 1, 'y': 1, 'z': 1}

    def read_raw_data(self):
        """Read raw magnetometer values"""
        mag_x, mag_y, mag_z = self.sensor.magnetic
        return {
            'x': mag_x,
            'y': mag_y,
            'z': mag_z,
            'magnitude': (mag_x**2 + mag_y**2 + mag_z**2)**0.5
        }

    def calibrate(self, duration=10):
        """
        Calibrate the magnetometer
        duration: calibration time in seconds
        """
        print("Starting calibration...")
        print("Please rotate the sensor in all directions for", duration, "seconds")
        
        # Initialize min/max values
        min_vals = {'x': 1000, 'y': 1000, 'z': 1000}
        max_vals = {'x': -1000, 'y': -1000, 'z': -1000}
        
        start_time = time.monotonic()
        while (time.monotonic() - start_time) < duration:
            data = self.read_raw_data()
            
            # Update min/max values
            for axis in ['x', 'y', 'z']:
                min_vals[axis] = min(min_vals[axis], data[axis])
                max_vals[axis] = max(max_vals[axis], data[axis])
            
            # Print progress
            remaining = int(duration - (time.monotonic() - start_time))
            print(f"Time remaining: {remaining} seconds", end='\r')
            time.sleep(0.1)
        
        # Calculate calibration values
        for axis in ['x', 'y', 'z']:
            self.offset[axis] = (max_vals[axis] + min_vals[axis]) / 2
            self.scale[axis] = (max_vals[axis] - min_vals[axis]) / 2
            if self.scale[axis] == 0:
                self.scale[axis] = 1  # Prevent division by zero
        
        print("\nCalibration complete!")
        print("Offsets:", self.offset)
        print("Scaling:", self.scale)

    def read_calibrated_data(self):
        """Read and apply calibration to magnetometer values"""
        raw = self.read_raw_data()
        calibrated = {}
        
        for axis in ['x', 'y', 'z']:
            calibrated[axis] = (raw[axis] - self.offset[axis]) / self.scale[axis]
        
        calibrated['magnitude'] = (calibrated['x']**2 + 
                                 calibrated['y']**2 + 
                                 calibrated['z']**2)**0.5
        return calibrated

def main():
    try:
        # Initialize magnetometer
        mag = MagnetometerReader()
        
        # Perform initial calibration
        mag.calibrate()
        
        print("\nStarting continuous reading...")
        print("Press Ctrl+C to exit")
        
        while True:
            # Read both raw and calibrated data
            raw_data = mag.read_raw_data()
            cal_data = mag.read_calibrated_data()
            
            # Print formatted output
            print("\nRaw Magnetic field (microTesla):")
            print(f"X: {raw_data['x']:8.2f}")
            print(f"Y: {raw_data['y']:8.2f}")
            print(f"Z: {raw_data['z']:8.2f}")
            print(f"Magnitude: {raw_data['magnitude']:8.2f}")
            
            print("\nCalibrated Magnetic field (normalized):")
            print(f"X: {cal_data['x']:8.2f}")
            print(f"Y: {cal_data['y']:8.2f}")
            print(f"Z: {cal_data['z']:8.2f}")
            print(f"Magnitude: {cal_data['magnitude']:8.2f}")
            
            print("-" * 40)
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\nProgram terminated by user")
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    main()
