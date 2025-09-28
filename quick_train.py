
# COPY THIS CODE AND RUN IT FOR 5-MINUTE TRAINING!
from pathlib import Path
import sys

# Add the trainer code here (copy from the main artifact)
# Then run:

if __name__ == "__main__":
    # SUPER FAST training config
    DATASET_PATH = "./D-Fire"
    
    trainer = DFireTrainer(DATASET_PATH, "./dfire_FAST_results")
    trainer.setup_directory_structure()
    
    # Use tiny dataset
    trainer.prepare_dataset(max_images=50, test_ratio=0.0)
    
    # LIGHTNING FAST training (5 minutes!)
    trainer.train_yolov8_FAST_CPU(
        epochs=5,      # Even fewer epochs!
        imgsz=224,     # Even smaller images!
        batch_size=2   # Tiny batch size
    )
    
    print("🎉 Done in ~5 minutes!")
