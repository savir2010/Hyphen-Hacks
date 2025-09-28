#!/usr/bin/env python3
"""
Enhanced DJI Tello Simple Square Scouting with Fire/Smoke Detection
Improved IMU handling and error recovery
"""

import cv2
from ultralytics import YOLO
from djitellopy import Tello
import time
import json
import os
from collections import defaultdict
import sys
import traceback
from datetime import datetime

class EnhancedSquareScout:
    def __init__(self, fire_smoke_model_path, general_model_path, output_dir="enhanced_scout_results"):
        self.fire_smoke_model_path = fire_smoke_model_path
        self.general_model_path = general_model_path
        self.output_dir = output_dir
        self.photo_counter = 0
        self.detection_results = []
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Initialize models
        try:
            self.fire_smoke_model = YOLO(fire_smoke_model_path)
            self.general_model = YOLO(general_model_path)
            print(f"✅ Loaded fire/smoke model: {fire_smoke_model_path}")
            print(f"✅ Loaded general model: {general_model_path}")
        except Exception as e:
            print(f"❌ Failed to load models: {e}")
            raise

    def check_drone_health(self, tello):
        """Check drone health status including IMU."""
        health_status = {
            'battery': None,
            'temperature': None,
            'height': None,
            'flight_time': None,
            'wifi_signal': None
        }
        
        try:
            health_status['battery'] = tello.get_battery()
            print(f"🔋 Battery: {health_status['battery']}%")
        except Exception as e:
            print(f"⚠️ Could not get battery: {e}")
        
        try:
            health_status['temperature'] = tello.get_temperature()
            print(f"🌡️ Temperature: {health_status['temperature']}°C")
        except Exception as e:
            print(f"⚠️ Could not get temperature: {e}")
            
        try:
            health_status['height'] = tello.get_height()
            print(f"📏 Height: {health_status['height']}cm")
        except Exception as e:
            print(f"⚠️ Could not get height: {e}")
            
        return health_status

    def calibrate_imu(self, tello):
        """Attempt to calibrate IMU and stabilize drone."""
        print("🔧 Attempting IMU calibration...")
        
        # First, ensure we're hovering stable
        try:
            print("⏳ Hovering for stabilization...")
            tello.send_command_with_return("stop", timeout=5)
            time.sleep(3)
            
            # Try basic attitude check
            print("📐 Checking drone attitude...")
            tello.send_command_with_return("attitude?", timeout=5)
            time.sleep(1)
            
            print("✅ IMU stabilization complete")
            return True
            
        except Exception as e:
            print(f"❌ IMU calibration failed: {e}")
            return False

    def stabilize_drone(self, tello, wait_time=3):
        """Enhanced stabilization with health check."""
        print("⏳ Stabilizing drone...")
        
        # Send stop command to ensure stable hover
        try:
            tello.send_command_with_return("stop", timeout=5)
            time.sleep(wait_time)
            
            # Check if drone is stable
            height_readings = []
            for i in range(3):
                try:
                    height = tello.get_height()
                    height_readings.append(height)
                    time.sleep(0.5)
                except:
                    pass
            
            if len(height_readings) >= 2:
                height_variance = max(height_readings) - min(height_readings)
                if height_variance > 20:  # More than 20cm variance
                    print(f"⚠️ Drone unstable - height variance: {height_variance}cm")
                    time.sleep(2)  # Extra stabilization time
                else:
                    print("✅ Drone stable")
            
        except Exception as e:
            print(f"⚠️ Stabilization check failed: {e}")
            time.sleep(wait_time)

    def move_and_wait_enhanced(self, tello, command, timeout=15, max_retries=3):
        """Enhanced movement with IMU error handling and retries."""
        for attempt in range(max_retries):
            try:
                print(f"🛸 Executing: {command} (Attempt {attempt + 1}/{max_retries})")
                
                # Pre-movement stabilization
                self.stabilize_drone(tello, 1)
                
                response = tello.send_command_with_return(command, timeout=timeout)
                print(f"   Response: {response}")
                
                if "ok" in response.lower():
                    print("   ✅ Movement successful")
                    self.stabilize_drone(tello, 2)
                    return True
                    
                elif "error No valid imu" in response.lower():
                    print("   ⚠️ IMU error - attempting calibration...")
                    
                    # Attempt IMU recalibration
                    if self.calibrate_imu(tello):
                        print("   🔧 IMU recalibrated - retrying movement...")
                        time.sleep(2)
                        continue
                    else:
                        print("   ❌ IMU calibration failed")
                        
                elif "error Motor stop" in response.lower():
                    print("   ⚠️ Motor stopped - waiting for recovery...")
                    time.sleep(3)
                    continue
                    
                else:
                    print(f"   ⚠️ Movement issue: {response}")
                    time.sleep(1)
                    continue
                    
            except Exception as e:
                print(f"   ❌ Movement exception: {e}")
                time.sleep(1)
                
        print(f"❌ Movement failed after {max_retries} attempts: {command}")
        return False

    def detect_and_annotate(self, frame):
        """Run detection on frame and return annotated frame with results."""
        # Run fire/smoke detection
        results_fire_smoke = self.fire_smoke_model(frame, conf=0.25, verbose=False)
        
        # Run general detection for ALL classes
        results_general = self.general_model(frame, conf=0.3, verbose=False)

        annotated_frame = frame.copy()
        detections = {
            'fire': 0,
            'smoke': 0,
            'general_objects': {},
            'total_objects': 0,
            'high_confidence_fire': 0,
            'high_confidence_smoke': 0
        }

        # Process fire/smoke model detections
        if results_fire_smoke[0].boxes is not None and len(results_fire_smoke[0].boxes) > 0:
            for box in results_fire_smoke[0].boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls_id = int(box.cls.item())
                conf = round(box.conf.item(), 2)
                
                original_name = results_fire_smoke[0].names[cls_id]
                
                # Label swapping logic
                if original_name.lower() == "smoke":
                    display_name = "fire"
                    color = (0, 0, 255)  # Red
                    detections['fire'] += 1
                    if conf > 0.5:
                        detections['high_confidence_fire'] += 1
                elif original_name.lower() == "fire":
                    display_name = "smoke"
                    color = (128, 128, 128)  # Gray
                    detections['smoke'] += 1
                    if conf > 0.5:
                        detections['high_confidence_smoke'] += 1
                else:
                    display_name = original_name
                    color = (0, 255, 255)  # Yellow
                
                # Draw detection box
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 3)
                label = f"{display_name}: {conf}"
                cv2.putText(annotated_frame, label, (x1, y1 - 10), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        # Process general model detections
        if results_general[0].boxes is not None and len(results_general[0].boxes) > 0:
            for box in results_general[0].boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls_id = int(box.cls.item())
                conf = round(box.conf.item(), 2)
                
                class_name = results_general[0].names[cls_id]
                
                # Count objects by type
                if class_name not in detections['general_objects']:
                    detections['general_objects'][class_name] = 0
                detections['general_objects'][class_name] += 1
                detections['total_objects'] += 1
                
                # Color mapping
                color_map = {
                    'person': (255, 0, 0),     # Blue
                    'car': (0, 255, 0),       # Green
                    'truck': (0, 255, 0),     # Green
                    'bicycle': (255, 255, 0), # Cyan
                    'motorcycle': (255, 255, 0), # Cyan
                    'bus': (0, 255, 0),       # Green
                    'dog': (255, 0, 255),     # Magenta
                    'cat': (255, 0, 255),     # Magenta
                    'bird': (128, 0, 128),    # Purple
                }
                
                color = color_map.get(class_name, (255, 255, 255))
                
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                label = f"{class_name}: {conf}"
                cv2.putText(annotated_frame, label, (x1, y1 - 10), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        return annotated_frame, detections

    def capture_and_analyze(self, tello, position_name):
        """Capture photo and run analysis with enhanced error handling."""
        print(f"📸 Capturing: {position_name}")
        
        try:
            # Ensure stable hover before capture
            self.stabilize_drone(tello, 1)
            
            frame_read = tello.get_frame_read()
            if frame_read is None:
                print("❌ No frame reader available")
                return None
                
            frame = frame_read.frame
            
            if frame is None:
                print("❌ No frame captured - retrying...")
                time.sleep(1)
                frame = frame_read.frame
                
            if frame is None:
                print("❌ Still no frame - skipping capture")
                return None
            
            # Run detection
            annotated_frame, detections = self.detect_and_annotate(frame)
            
            # Save photo
            timestamp = datetime.now().strftime("%H%M%S")
            filename = f"enhanced_{self.photo_counter:02d}_{position_name}_{timestamp}.jpg"
            filepath = os.path.join(self.output_dir, filename)
            
            cv2.imwrite(filepath, annotated_frame)
            self.photo_counter += 1
            
            # Store results
            detection_info = {
                'position': position_name,
                'timestamp': timestamp,
                'filename': filename,
                'detections': detections
            }
            self.detection_results.append(detection_info)
            
            # Print detection summary
            print(f"  🔥 Fire: {detections['fire']}, 💨 Smoke: {detections['smoke']}")
            print(f"  📦 Objects: {detections['total_objects']}")
            if detections['general_objects']:
                objects_summary = ", ".join([f"{obj}:{count}" for obj, count in detections['general_objects'].items()])
                print(f"  🎯 Detected: {objects_summary}")
            
            return detection_info
            
        except Exception as e:
            print(f"❌ Capture failed: {e}")
            return None

    def execute_conservative_pattern(self, tello, small_size=30):
        """Execute a smaller, more conservative pattern for low battery/IMU issues using turns."""
        print(f"🔍 Starting CONSERVATIVE scouting pattern with TURNS...")
        print(f"📐 Pattern size: {small_size}cm per side")
        
        # Take photo at starting position
        self.capture_and_analyze(tello, "start_center")
        
        # Conservative 4-side pattern with forward movement and turns

        positions = [
            {"move": f"forward {small_size}", "turn": "cw 90", "name": "side_1", "description": "Forward + Turn CW (1/4)"},
            {"move": f"forward {small_size}", "turn": "cw 90", "name": "side_2", "description": "Forward + Turn CW (2/4)"},
            {"move": f"forward {small_size}", "turn": "cw 90", "name": "side_3", "description": "Forward + Turn CW (3/4)"},
            {"move": f"forward {small_size}", "turn": "cw 90", "name": "side_4", "description": "Forward + Turn CW (4/4) - Back to start"}
        ]
        
        successful_moves = 0
        for i, pos in enumerate(positions):
            print(f"\n📍 Side {i+1}/4: {pos['description']}")
            
            # Move forward
            if self.move_and_wait_enhanced(tello, pos['move']):
                print(f"   ✅ Forward movement successful")
                self.capture_and_analyze(tello, f"{pos['name']}_forward")
                
                # Turn 90 degrees clockwise
                if self.move_and_wait_enhanced(tello, pos['turn']):
                    print(f"   ✅ Turn successful")
                    self.capture_and_analyze(tello, f"{pos['name']}_after_turn")
                    successful_moves += 1
                else:
                    print(f"   ⚠️ Turn failed but continuing")
                    successful_moves += 0.5  # Partial success
                    self.capture_and_analyze(tello, f"{pos['name']}_no_turn")
            else:
                print(f"   ❌ Forward movement failed - continuing with remaining pattern")
                self.capture_and_analyze(tello, f"{pos['name']}_failed")
        
        print(f"\n✅ Conservative turning pattern complete - {successful_moves}/4 sides successful")
        return successful_moves

    def execute_enhanced_square(self, tello, square_size=60):
        """Execute square pattern using forward movement + 90-degree clockwise turns."""
        print(f"🔍 Starting ENHANCED SQUARE scouting with TURNS...")
        print(f"📐 Square size: {square_size}cm per side")
        print("🔄 Pattern: Forward → Turn 90° CW → Forward → Turn 90° CW → etc.")
        
        # Check health before starting
        health = self.check_drone_health(tello)
        
        # Decide on pattern based on battery and conditions
        if health['battery'] and health['battery'] < 50:
            print("⚠️ Low battery detected - switching to conservative pattern")
            return self.execute_conservative_pattern(tello, 30)
        
        # Take photo at starting position
        self.capture_and_analyze(tello, "start_center")
        
        # Square pattern: 4 sides with forward movement and 90-degree clockwise turns
        square_moves = [
            {"move": f"forward {square_size}", "turn": "cw 90", "corner": "side_1_complete", "description": "Side 1: Forward (North) + Turn CW"},
            {"move": f"forward {square_size}", "turn": "cw 90", "corner": "side_2_complete", "description": "Side 2: Forward (East) + Turn CW"},
            {"move": f"forward {square_size}", "turn": "cw 90", "corner": "side_3_complete", "description": "Side 3: Forward (South) + Turn CW"},
            {"move": f"forward {square_size}", "turn": "cw 90", "corner": "side_4_complete", "description": "Side 4: Forward (West) + Turn CW - Square Complete!"}
        ]
        
        successful_sides = 0
        for side_num, move_info in enumerate(square_moves, 1):
            print(f"\n📏 Side {side_num}/4: {move_info['description']}")
            
            # Execute forward movement
            print(f"   🛸 Moving forward {square_size}cm...")
            if self.move_and_wait_enhanced(tello, move_info['move']):
                print(f"   ✅ Forward movement complete")
                
                # Take photo at end of side
                self.capture_and_analyze(tello, f"end_of_side_{side_num}")
                
                # Execute 90-degree clockwise turn
                print(f"   🔄 Turning 90° clockwise...")
                if self.move_and_wait_enhanced(tello, move_info['turn']):
                    print(f"   ✅ Turn complete")
                    successful_sides += 1
                    
                    # Take photo after turn (at corner)
                    self.capture_and_analyze(tello, move_info['corner'])
                    print(f"  ✅ Side {side_num} complete - now facing new direction")
                else:
                    print(f"  ⚠️ Turn failed on side {side_num} - continuing anyway")
                    successful_sides += 0.5  # Partial success
                    self.capture_and_analyze(tello, f"{move_info['corner']}_no_turn")
            else:
                print(f"  ❌ Forward movement failed on side {side_num} - aborting square")
                break
        
        # Final photo at completion
        if successful_sides >= 3:  # If we completed most of the square
            self.capture_and_analyze(tello, "square_complete")
            print("📸 Square pattern complete - taking final photo")
        
        print(f"✅ Enhanced turning square complete - {successful_sides}/4 sides successful")
        return successful_sides

    def generate_enhanced_report(self):
        """Generate comprehensive mission report."""
        # Calculate totals
        total_fire = sum([d['detections']['fire'] for d in self.detection_results])
        total_smoke = sum([d['detections']['smoke'] for d in self.detection_results])
        total_objects = sum([d['detections']['total_objects'] for d in self.detection_results])
        high_conf_fire = sum([d['detections']['high_confidence_fire'] for d in self.detection_results])
        
        # Aggregate all detected objects
        all_objects = {}
        for result in self.detection_results:
            for obj, count in result['detections']['general_objects'].items():
                if obj not in all_objects:
                    all_objects[obj] = 0
                all_objects[obj] += count
        
        # Find hotspots
        fire_locations = [d['position'] for d in self.detection_results if d['detections']['fire'] > 0]
        high_activity_locations = [d['position'] for d in self.detection_results if d['detections']['total_objects'] > 2]
        
        report = {
            'mission_summary': {
                'total_photos': self.photo_counter,
                'fire_detections': total_fire,
                'smoke_detections': total_smoke,
                'total_objects_detected': total_objects,
                'high_confidence_fire': high_conf_fire,
                'objects_by_type': all_objects,
                'fire_locations': fire_locations,
                'high_activity_locations': high_activity_locations,
                'mission_time': datetime.now().isoformat()
            },
            'detailed_results': self.detection_results
        }
        
        # Save report
        report_path = os.path.join(self.output_dir, 'enhanced_mission_report.json')
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print("\n" + "="*60)
        print("🎯 ENHANCED SQUARE SCOUT MISSION REPORT")
        print("="*60)
        print(f"📸 Photos captured: {self.photo_counter}")
        print(f"🔥 Fire detections: {total_fire} (High confidence: {high_conf_fire})")
        print(f"💨 Smoke detections: {total_smoke}")
        print(f"📦 Total objects detected: {total_objects}")
        
        if all_objects:
            print("🎯 Objects detected:")
            for obj_type, count in sorted(all_objects.items()):
                print(f"   {obj_type}: {count}")
        
        if fire_locations:
            print(f"🚨 Fire detected at: {', '.join(fire_locations)}")
        
        if high_activity_locations:
            print(f"🏃 High activity at: {', '.join(high_activity_locations)}")
            
        print(f"📁 Results saved to: {self.output_dir}")
        print("="*60)
        
        return report

def main():
    # Configuration
    fire_smoke_model_path = "/Users/savirdillikar/aws-hack/drone-testing/dfire_balanced_results/dfire_balanced_train/weights/best.pt"
    general_model_path = "yolov8n.pt"
    output_dir = f"enhanced_scout_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Adaptive mission parameters
    SQUARE_SIZE = 150  # Reduced from 100cm for better stability
    
    # Initialize enhanced scout
    try:
        scout = EnhancedSquareScout(fire_smoke_model_path, general_model_path, output_dir)
    except Exception as e:
        print(f"❌ Failed to initialize scout: {e}")
        return
    
    # Initialize Tello
    tello = Tello()
    try:
        print("🔌 Connecting to Tello...")
        tello.connect()
        
        # Enhanced connection verification
        health = scout.check_drone_health(tello)
        
        if health['battery'] and health['battery'] < 20:
            print("❌ Battery too low for mission (< 20%)")
            return
            
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        return
    
    # Start video stream with retry
    print("📡 Starting video stream...")
    max_stream_retries = 3
    for attempt in range(max_stream_retries):
        try:
            tello.streamon()
            time.sleep(3)
            
            # Test frame capture
            frame_read = tello.get_frame_read()
            if frame_read is not None:
                test_frame = frame_read.frame
                if test_frame is not None:
                    print("✅ Video stream active")
                    break
                    
        except Exception as e:
            print(f"⚠️ Stream attempt {attempt + 1} failed: {e}")
            if attempt < max_stream_retries - 1:
                time.sleep(2)
            else:
                print("❌ Could not establish video stream")
                return
    
    # Set conservative speed for stable flight
    try:
        tello.set_speed(25)  # Even slower for stability
        print("✈️ Flight speed set to 25cm/s")
    except Exception as e:
        print(f"⚠️ Speed setting failed: {e}")
    
    try:
        print(f"\n🚁 Starting ENHANCED Fire/Smoke Scout Mission with TURNING SQUARE")
        print(f"📏 Target square size: {SQUARE_SIZE}cm per side")
        print("🔄 Flight pattern: Forward → Turn 90° CW → Forward → Turn 90° CW...")
        print(f"📁 Results will be saved to: {output_dir}")
        
        # Takeoff with enhanced monitoring
        print("🛫 Taking off...")
        tello.takeoff()
        try:
            print("⬆️ Rising 60cm...")
            tello.move_up(60)
            time.sleep(2)  # brief pause for stability
        except Exception as e:
            print(f"⚠️ Could not move up 60cm: {e}")

        # Extended post-takeoff stabilization
        scout.stabilize_drone(tello, 5)
                
        # Check post-takeoff health
        post_takeoff_health = scout.check_drone_health(tello)
        
        # Execute enhanced square pattern
        start_time = time.time()
        successful_moves = scout.execute_enhanced_square(tello, SQUARE_SIZE)
        mission_time = time.time() - start_time
        
        print(f"\n⏱️ Mission completed in {mission_time:.1f} seconds")
        print(f"✅ Successful movements: {successful_moves}")
        
        # Safe landing
        print("🛬 Landing...")
        tello.land()
        time.sleep(3)
        
    except KeyboardInterrupt:
        print("\n⚠️ Mission interrupted - emergency landing")
        try:
            tello.land()
        except:
            tello.emergency()
    except Exception as e:
        print(f"\n❌ Mission error: {e}")
        traceback.print_exc()
        try:
            print("🚨 Attempting emergency landing...")
            tello.emergency()
        except:
            pass
    finally:
        # Generate comprehensive report
        scout.generate_enhanced_report()
        
        # Cleanup
        try:
            tello.streamoff()
            tello.end()
        except:
            pass
        
        cv2.destroyAllWindows()
        print("\n✅ Enhanced Scout Mission Complete!")

if __name__ == "__main__":
    main()