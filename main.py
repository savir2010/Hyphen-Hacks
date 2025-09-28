#!/usr/bin/env python3
"""
DJI Tello Automated Flight with Real-time YOLO Object Detection
Fixed/cleaned version of the user's script.
"""

import cv2
from ultralytics import YOLO
from djitellopy import Tello
import time
import json
from collections import defaultdict
import sys
import traceback

def imu_calibration_sequence(tello):
    """Attempt to recalibrate IMU through gentle movement patterns."""
    print("  🔧 Attempting IMU recalibration sequence...")
    calibration_moves = [
        ("up", 10),
        ("down", 10),
        ("left", 10),
        ("right", 10)
    ]

    for direction, distance in calibration_moves:
        try:
            print(f"  Calibration move: {direction} {distance}")
            # try using a high-level method if present, otherwise send raw command
            method = getattr(tello, f"move_{direction}", None)
            if callable(method):
                method(distance)
            else:
                # fallback to raw command (some SDKs expect "up 10")
                tello.send_command_with_return(f"{direction} {distance}")
            time.sleep(1)
        except Exception as e:
            print(f"  Calibration move {direction} failed: {e}")
            continue

    # Gentle rotation for orientation reset
    try:
        print("  Gentle rotation for orientation reset...")
        # prefer available high-level rotate methods; fallback to raw commands
        if hasattr(tello, "rotate_clockwise"):
            tello.rotate_clockwise(15)
            time.sleep(1)
            tello.rotate_counter_clockwise(15) if hasattr(tello, "rotate_counter_clockwise") else tello.rotate_clockwise(-15)
        else:
            tello.send_command_with_return("cw 15")
            time.sleep(1)
            tello.send_command_with_return("ccw 15")
        time.sleep(1)
    except Exception:
        pass

def force_imu_reset(tello):
    """Force IMU reset using low-level commands and small hover checks."""
    print("  🔄 Forcing IMU reset...")
    try:
        # Re-enter command mode if necessary
        try:
            tello.send_command_with_return("command")
            time.sleep(1)
        except Exception:
            # Some SDK versions don't expose send_command_with_return; ignore if not available
            pass

        # Try to get fresh sensor readings
        try:
            temp = tello.get_temperature() if hasattr(tello, "get_temperature") else "N/A"
            battery = tello.get_battery() if hasattr(tello, "get_battery") else "N/A"
            print(f"  Sensor check - Temp: {temp}°C, Battery: {battery}%")
        except Exception:
            pass

        # Small hover movement to test IMU
        try:
            if hasattr(tello, "move_up"):
                tello.move_up(5)
                time.sleep(2)
                tello.move_down(5)
            else:
                tello.send_command_with_return("up 5")
                time.sleep(2)
                tello.send_command_with_return("down 5")
            time.sleep(2)
        except Exception:
            pass

        return True
    except Exception as e:
        print(f"  IMU reset failed: {e}")
        return False

def safe_movement(tello, command_or_callable, command_name="command", *args, max_retries=5):
    """
    Execute a movement safely with IMU error handling and retry logic.
    command_or_callable: either a callable (Tello method) or a raw command string.
    If it's a string, it will be sent via tello.send_command_with_return(command_string).
    """
    for attempt in range(max_retries):
        try:
            print(f"  Attempting {command_name} (try {attempt + 1}/{max_retries})")
            if callable(command_or_callable):
                # call the Tello method with args
                command_or_callable(*args)
            else:
                # treat as raw command string; optionally include args
                cmd = command_or_callable if not args else f"{command_or_callable} {' '.join(map(str, args))}"
                if hasattr(tello, "send_command_with_return"):
                    tello.send_command_with_return(cmd)
                else:
                    # fallback: some SDKs use send_command
                    send = getattr(tello, "send_command", None)
                    if callable(send):
                        send(cmd)
                    else:
                        raise RuntimeError("No method to send raw command to Tello.")
            print(f"  ✅ {command_name} successful")
            return True
        except Exception as e:
            error_msg = str(e).lower()
            # debug print full traceback for developer
            print(f"  ⚠️ {command_name} failed: {e}")
            traceback.print_exc(file=sys.stdout)

            if "no valid imu" in error_msg or "imu" in error_msg:
                print(f"  ⚠️ IMU error detected, waiting for stabilization...")
                time.sleep(5)  # longer wait for IMU to stabilize
                # try IMU calibration sequence and then retry
                try:
                    imu_calibration_sequence(tello)
                except Exception:
                    pass
            else:
                time.sleep(2)

            if attempt < max_retries - 1:
                print(f"  Retrying in 2 seconds...")
                time.sleep(2)
            else:
                print(f"  ❌ {command_name} failed after {max_retries} attempts")
                return False
    return False

def check_imu_status(tello):
    """Check IMU status before flight and attempt stabilization if needed."""
    print("Checking IMU status...")
    try:
        print("  Testing IMU with small movement...")
        if hasattr(tello, "move_up"):
            tello.move_up(5)
            time.sleep(1)
            tello.move_down(5)
            time.sleep(1)
        else:
            tello.send_command_with_return("up 5")
            time.sleep(1)
            tello.send_command_with_return("down 5")
            time.sleep(1)
        print("  ✅ IMU appears stable")
        return True
    except Exception as e:
        error_msg = str(e).lower()
        if "no valid imu" in error_msg or "imu" in error_msg:
            print("  ⚠️ IMU unstable detected - attempting pre-flight calibration")
            imu_calibration_sequence(tello)
            # Test again
            try:
                if hasattr(tello, "move_up"):
                    tello.move_up(5)
                    time.sleep(1)
                    tello.move_down(5)
                else:
                    tello.send_command_with_return("up 5")
                    time.sleep(1)
                    tello.send_command_with_return("down 5")
                time.sleep(1)
                print("  ✅ IMU stabilized after calibration")
                return True
            except Exception:
                print("  ❌ IMU still unstable - flight may have issues")
                return False
        else:
            print(f"  Movement test failed: {e}")
            return False

def count_objects(results, confidence_threshold=0.7):
    """Count bicycles and bowls with high confidence in YOLO results."""
    object_counts = defaultdict(int)

    # Ultralyitcs YOLO returns a Results object or list-like; handle accordingly.
    # We'll iterate through results (which may be a list); each result has .boxes and .names
    for res in results:
        boxes = getattr(res, "boxes", None)
        names = getattr(res, "names", {})
        if boxes is not None:
            for box in boxes:
                # box.conf and box.cls extraction depends on ultralytics version
                try:
                    confidence = float(box.conf.item()) if hasattr(box, "conf") else float(box.conf)
                    class_id = int(box.cls.item()) if hasattr(box, "cls") else int(box.cls)
                    class_name = names.get(class_id, str(class_id))
                except Exception:
                    # fallback: if fields different, skip
                    continue

                if confidence >= confidence_threshold:
                    if class_name == 'bicycle':
                        object_counts['bicycles'] += 1
                    elif class_name == 'bowl':
                        object_counts['bowls'] += 1

    return object_counts

def main():
    # --- Configuration (adjust paths as needed) ---
    model_path = '/Users/savirdillikar/aws-hack/drone-testing/yolov8n.pt'
    video_path = '/Users/savirdillikar/aws-hack/drone-testing/tello_flight_detection.mp4'
    json_path = '/Users/savirdillikar/aws-hack/drone-testing/detection_results.json'
    confidence_threshold = 0.7

    # Initialize Tello
    tello = Tello()
    tello.connect()
    try:
        print(f"Battery: {tello.get_battery()}%")
    except Exception:
        print("Could not read battery level")

    total_bicycles = 0
    total_bowls = 0
    frame_count = 0

    # Start video stream
    tello.streamon()
    time.sleep(2)

    # Set flight speed (keep conservative)
    try:
        tello.set_speed(50)
    except Exception:
        pass

    # Load YOLO model
    try:
        model = YOLO(model_path, task='detect')
        print("YOLO model loaded successfully")
    except Exception as e:
        print(f"Failed to load YOLO model: {e}")
        return

    # Video writer will be initialized after we get the first frame (to get frame size)
    frame_read = tello.get_frame_read()

    video_out = None

    try:
        # Pre-flight IMU check
        if not check_imu_status(tello):
            print("IMU unstable. Trying force reset...")
            force_imu_reset(tello)
            if not check_imu_status(tello):
                print("Warning: IMU unstable after attempts. Proceeding with caution.")

        # Start automated flight sequence
        print("Starting automated flight...")

        print("Taking off...")
        tello.takeoff()
        print("Waiting for IMU stabilization after takeoff...")
        time.sleep(8)  # extended stabilization

        # Define movements as tuples: (callable_or_command, name, arg)
        # Prefer using Tello methods if available; otherwise use raw command strings.
        movements = []
        # try to use existing high-level methods if available
        if hasattr(tello, "move_up"):
            movements = [
                (tello.move_up, "move_up", 20),
                (tello.move_forward, "move_forward", 30),
                (tello.rotate_clockwise if hasattr(tello, "rotate_clockwise") else "cw", "rotate_clockwise", 45),
                (tello.move_forward, "move_forward", 30),
                (tello.rotate_clockwise if hasattr(tello, "rotate_clockwise") else "cw", "rotate_clockwise", 45),
                (tello.move_forward, "move_forward", 30)
            ]
        else:
            # fallback to raw commands
            movements = [
                ("up", "up", 40),
                ("forward", "forward", 50),
                ("cw", "rotate_clockwise", 90),
                ("forward", "forward", 40),
                ("cw", "rotate_clockwise", 90),
                ("forward", "forward", 50)
            ]

        for cmd, name, value in movements:
            print(f"Executing: {name} {value}")
            ok = safe_movement(tello, cmd, name, value)
            if not ok:
                print(f"Skipping {name} due to repeated failures")
                continue

            # Stabilize and run detection for a few seconds after each movement
            print("  Stabilizing after movement...")
            start_time = time.time()
            while time.time() - start_time < 5:
                frame = getattr(frame_read, "frame", None)
                if frame is None:
                    time.sleep(0.05)
                    continue

                # initialize video writer once we have a frame and no video_out yet
                if video_out is None:
                    h, w = frame.shape[:2]
                    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                    video_out = cv2.VideoWriter(video_path, fourcc, 20, (w, h), isColor=True)

                results = model(frame)  # ultralytics model inference

                frame_objects = count_objects(results, confidence_threshold)
                total_bicycles = max(total_bicycles, frame_objects.get('bicycles', 0))
                total_bowls = max(total_bowls, frame_objects.get('bowls', 0))
                frame_count += 1

                annotated_frame = results[0].plot()
                annotated_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
                if video_out is not None:
                    video_out.write(annotated_frame)
                cv2.imshow("YOLO Detection - Flight", annotated_frame)
                if cv2.waitKey(1) & 0xFF == ord('x'):
                    raise KeyboardInterrupt

        # Final hover detection
        print("Final hover with detection...")
        hover_time = time.time()
        while time.time() - hover_time < 5:
            frame = getattr(frame_read, "frame", None)
            if frame is None:
                time.sleep(0.05)
                continue

            results = model(frame)
            frame_objects = count_objects(results, confidence_threshold)
            total_bicycles = max(total_bicycles, frame_objects.get('bicycles', 0))
            total_bowls = max(total_bowls, frame_objects.get('bowls', 0))
            frame_count += 1

            annotated_frame = results[0].plot()
            annotated_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
            if video_out is not None:
                video_out.write(annotated_frame)
            cv2.imshow("YOLO Detection - Flight", annotated_frame)
            if cv2.waitKey(1) & 0xFF == ord('x'):
                break

        # Land
        print("Landing...")
        landed_ok = safe_movement(tello, tello.land if hasattr(tello, "land") else "land", "land")
        if not landed_ok:
            print("Emergency landing...")
            try:
                tello.emergency()
            except Exception:
                pass

    except KeyboardInterrupt:
        print("Flight interrupted by user")
        try:
            tello.land()
        except Exception:
            try:
                tello.emergency()
            except Exception:
                pass
    except Exception as e:
        print(f"Error during flight: {e}")
        traceback.print_exc(file=sys.stdout)
        try:
            tello.emergency()
        except Exception:
            pass
    finally:
        # Result JSON
        result_data = {
            "detection_summary": {
                "total_bicycles_detected": total_bicycles,
                "total_bowls_detected": total_bowls,
                "confidence_threshold": confidence_threshold,
                "frames_processed": frame_count,
                "flight_completed": True
            }
        }

        # Save JSON to file
        try:
            with open(json_path, 'w') as f:
                json.dump(result_data, f, indent=2)
        except Exception as e:
            print(f"Failed to write JSON: {e}")

        print("\n" + "="*50)
        print("DETECTION RESULTS:")
        print(json.dumps(result_data, indent=2))
        print("="*50)

        if 'video_out' in locals() and video_out is not None:
            video_out.release()
        try:
            tello.streamoff()
        except Exception:
            pass
        try:
            tello.end()
        except Exception:
            pass
        cv2.destroyAllWindows()
        print("Flight completed")

if __name__ == "__main__":
    main()
