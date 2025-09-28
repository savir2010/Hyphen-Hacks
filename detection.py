from ultralytics import YOLO
import cv2

# Load YOLO model
model = YOLO("yolov8n.pt")  # Pretrained COCO model

# Open the video
video_path = "forest.mp4"
results = model.predict(source=video_path, stream=True)  # stream=True lets you loop through frames

tree_class_ids = [64]  # COCO class ID for 'potted plant' (as placeholder for trees)

for frame_result in results:
    frame = frame_result.orig_img  # Original frame
    detections = frame_result.boxes

    tree_count = 0

    for box in detections:
        cls_id = int(box.cls[0])
        if cls_id in tree_class_ids:
            tree_count += 1

    print(f"Trees detected in this frame: {tree_count}")

    # Show video with boxes
    annotated_frame = frame_result.plot()
    cv2.imshow("Detection", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()
