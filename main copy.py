import cv2
from ultralytics import YOLO
import numpy as np

def analyze_video(custom_model_path, general_model_path, video_path, output_path="annotated_output.mp4", conf_threshold=0.5):
    # Load both models
    fire_smoke_model = YOLO(custom_model_path)
    general_model = YOLO(general_model_path)
    print(f"✅ Loaded custom model: {custom_model_path}")
    print(f"✅ Loaded general model: {general_model_path}")

    # Open video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ Error: Could not open video file {video_path}")
        return

    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    print(f"✅ Saving annotated video to: {output_path}")

    frame_num = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_num += 1

        # Run both detections
        results_custom = fire_smoke_model(frame, conf=conf_threshold)
        results_general = general_model(frame, conf=conf_threshold, classes=[0])  # class 0 = person

        # Start with original frame for annotation
        annotated_frame = frame.copy()

        # --- Handle custom model detections (fire/smoke) ---
        if results_custom[0].boxes is not None and len(results_custom[0].boxes) > 0:
            for box in results_custom[0].boxes:
                # Get box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls_id = int(box.cls.item())
                conf = round(box.conf.item(), 2)
                
                # Get original class name
                original_name = results_custom[0].names[cls_id]
                
                # Swap fire <-> smoke labels for display
                if original_name.lower() == "smoke":
                    display_name = "fire"
                    color = (0, 0, 255)  # Red for fire
                elif original_name.lower() == "fire":
                    display_name = "smoke"
                    color = (128, 128, 128)  # Gray for smoke
                else:
                    display_name = original_name
                    color = (0, 255, 255)  # Yellow for other classes

                print(f"[Custom] Frame {frame_num} -> {display_name}: {conf}")
                
                # Draw bounding box and label
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                label = f"{display_name}: {conf}"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
                cv2.rectangle(annotated_frame, (x1, y1 - label_size[1] - 10), 
                            (x1 + label_size[0], y1), color, -1)
                cv2.putText(annotated_frame, label, (x1, y1 - 5), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        # --- Handle general model detections (people) ---
        if results_general[0].boxes is not None and len(results_general[0].boxes) > 0:
            for box in results_general[0].boxes:
                # Get box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls_id = int(box.cls.item())
                conf = round(box.conf.item(), 2)
                class_name = results_general[0].names[cls_id]
                
                print(f"[General] Frame {frame_num} -> {class_name}: {conf}")
                
                # Draw bounding box and label for people
                color = (255, 0, 0)  # Blue for people
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                label = f"{class_name}: {conf}"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
                cv2.rectangle(annotated_frame, (x1, y1 - label_size[1] - 10), 
                            (x1 + label_size[0], y1), color, -1)
                cv2.putText(annotated_frame, label, (x1, y1 - 5), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        # Save frame
        out.write(annotated_frame)

        # Show preview (optional)
        cv2.imshow("YOLO Detection Preview", annotated_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    print("✅ Processing complete!")

if __name__ == "__main__":
    analyze_video(
        custom_model_path="/Users/savirdillikar/aws-hack/drone-testing/dfire_balanced_results/dfire_balanced_train/weights/best.pt",
        general_model_path="yolov8n.pt",
        video_path="/Users/savirdillikar/aws-hack/drone-testing/stock-footage-aerial-wide-footage-of-smoke-from-a-house-fire-and-firemen-putting-out-fire.webm",
        output_path="annotated_fire_smoke_people.mp4",
        conf_threshold=0.05
    )