#!/usr/bin/env python3
"""
IMPROVED D-Fire Dataset Training Script
Balanced approach for both speed and accuracy with configurable modes
"""

import os
import yaml
import cv2
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
import shutil
from sklearn.model_selection import train_test_split
import torch
from ultralytics import YOLO
import pandas as pd
from PIL import Image
import glob
import time
import warnings
import argparse
warnings.filterwarnings('ignore')

class DFireTrainer:
    def __init__(self, dataset_path, output_dir="./dfire_training", mode="balanced"):
        """
        Initialize the D-Fire trainer with configurable training modes
        
        Args:
            dataset_path (str): Path to D-Fire dataset
            output_dir (str): Output directory for training artifacts
            mode (str): Training mode - 'fast', 'balanced', or 'accurate'
        """
        self.dataset_path = Path(dataset_path)
        self.output_dir = Path(output_dir)
        self.mode = mode
        self.output_dir.mkdir(exist_ok=True)
        
        # Class mapping for D-Fire dataset
        self.class_names = {0: 'fire', 1: 'smoke'}  # Fixed order: fire first, then smoke
        self.num_classes = len(self.class_names)
        
        # Mode configurations
        self.configs = {
            'fast': {
                'max_images': 100,
                'epochs': 10,
                'imgsz': 320,
                'batch_size': 8,
                'model': 'yolov8n.pt',
                'patience': 5,
                'workers': 2,
                'cache': False,
                'augmentation': 'minimal'
            },
            'balanced': {
                'max_images': 300,
                'epochs': 25,
                'imgsz': 512,
                'batch_size': 16,
                'model': 'yolov8s.pt',
                'patience': 10,
                'workers': 4,
                'cache': True,
                'augmentation': 'moderate'
            },
            'accurate': {
                'max_images': 1000,
                'epochs': 50,
                'imgsz': 640,
                'batch_size': 12,
                'model': 'yolov8m.pt',
                'patience': 15,
                'workers': 6,
                'cache': True,
                'augmentation': 'strong'
            }
        }
        
        self.config = self.configs[mode]
        
        print(f"🚀 Initializing D-Fire trainer in {mode.upper()} mode...")
        print(f"📁 Dataset path: {self.dataset_path}")
        print(f"📁 Output directory: {self.output_dir}")
        print(f"🏷️  Classes: {self.class_names}")
        print(f"⚙️  Config: {self.config}")

    def setup_directory_structure(self):
        """Create the required directory structure for YOLO training"""
        dirs_to_create = [
            'train/images', 'train/labels',
            'val/images', 'val/labels',
            'test/images', 'test/labels'
        ]
        
        for dir_name in dirs_to_create:
            (self.output_dir / dir_name).mkdir(parents=True, exist_ok=True)
        
        print("✅ Directory structure created")

    def validate_dataset_structure(self):
        """Validate that the D-Fire dataset has the expected structure"""
        expected_paths = [
            self.dataset_path / 'train' / 'images',
            self.dataset_path / 'train' / 'labels'
        ]
        
        missing_paths = [path for path in expected_paths if not path.exists()]
        
        if missing_paths:
            print("❌ Missing required dataset paths:")
            for path in missing_paths:
                print(f"   - {path}")
            return False
        
        # Check for images
        train_images = list((self.dataset_path / 'train' / 'images').glob('*'))
        if len(train_images) == 0:
            print("❌ No images found in train/images directory")
            return False
            
        print(f"✅ Found {len(train_images)} training images")
        return True

    def prepare_dataset(self):
        """
        Prepare dataset from existing D-Fire structure with improved handling
        """
        print(f"📊 Preparing dataset in {self.mode.upper()} mode...")
        
        if not self.validate_dataset_structure():
            print("❌ Dataset validation failed. Creating dummy dataset for testing...")
            return self.create_dummy_dataset()
        
        max_images = self.config['max_images']
        
        # Paths
        train_images_path = self.dataset_path / 'train' / 'images'
        train_labels_path = self.dataset_path / 'train' / 'labels'
        val_images_path = self.dataset_path / 'val' / 'images'
        val_labels_path = self.dataset_path / 'val' / 'labels'
        
        # Get all training images
        all_train_images = list(train_images_path.glob('*'))
        
        # Filter valid image extensions
        valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
        train_images = [img for img in all_train_images 
                       if img.suffix.lower() in valid_extensions]
        
        # Limit images based on mode
        if len(train_images) > max_images:
            print(f"📉 Limiting to {max_images} images for {self.mode} mode")
            train_images = train_images[:max_images]
        
        print(f"📊 Using {len(train_images)} training images")
        
        # Handle validation set
        if val_images_path.exists() and val_labels_path.exists():
            val_images = list(val_images_path.glob('*'))
            val_images = [img for img in val_images 
                         if img.suffix.lower() in valid_extensions]
            
            if len(val_images) > max_images // 4:
                val_images = val_images[:max_images // 4]
            
            print(f"📊 Using {len(val_images)} validation images")
            self._copy_files_with_validation(val_images, val_labels_path, 'val')
        else:
            # Create validation split from training data
            split_idx = int(len(train_images) * 0.8)
            val_images = train_images[split_idx:]
            train_images = train_images[:split_idx]
            
            print(f"📊 Created validation split: {len(val_images)} images")
            self._copy_files_with_validation(val_images, train_labels_path, 'val')
        
        # Copy training files
        self._copy_files_with_validation(train_images, train_labels_path, 'train')
        
        print("✅ Dataset preparation completed!")
        return True
    
    def _copy_files_with_validation(self, image_files, labels_path, split_name):
        """Copy files with improved error handling and validation"""
        copied_count = 0
        skipped_count = 0
        
        for img_path in image_files:
            try:
                # Validate image can be read
                test_img = cv2.imread(str(img_path))
                if test_img is None:
                    print(f"⚠️ Skipping corrupted image: {img_path.name}")
                    skipped_count += 1
                    continue
                
                # Copy image
                dest_img = self.output_dir / split_name / 'images' / img_path.name
                shutil.copy2(img_path, dest_img)
                
                # Handle corresponding label
                label_file = labels_path / (img_path.stem + '.txt')
                dest_label = self.output_dir / split_name / 'labels' / (img_path.stem + '.txt')
                
                if label_file.exists():
                    # Validate label file format
                    try:
                        with open(label_file, 'r') as f:
                            lines = f.readlines()
                        
                        # Basic validation of YOLO format
                        valid_lines = []
                        for line in lines:
                            parts = line.strip().split()
                            if len(parts) == 5:
                                try:
                                    class_id = int(parts[0])
                                    coords = [float(x) for x in parts[1:5]]
                                    # Ensure coordinates are in [0,1] range
                                    if 0 <= class_id < self.num_classes and all(0 <= x <= 1 for x in coords):
                                        valid_lines.append(line)
                                except ValueError:
                                    continue
                        
                        # Write validated labels
                        with open(dest_label, 'w') as f:
                            f.writelines(valid_lines)
                            
                    except Exception as e:
                        print(f"⚠️ Invalid label file {label_file.name}: {e}")
                        dest_label.touch()  # Create empty label file
                else:
                    # Create empty label file for images without annotations
                    dest_label.touch()
                
                copied_count += 1
                
            except Exception as e:
                print(f"⚠️ Error processing {img_path.name}: {e}")
                skipped_count += 1
        
        print(f"✅ {split_name}: copied {copied_count} files, skipped {skipped_count}")
        return copied_count

    def create_dummy_dataset(self):
        """Create dummy dataset for testing when real data is unavailable"""
        print("🎭 Creating dummy dataset for testing...")
        
        for split in ['train', 'val']:
            num_images = 50 if split == 'train' else 15
            
            for i in range(num_images):
                # Create realistic dummy image
                img = np.random.randint(100, 200, (640, 640, 3), dtype=np.uint8)
                
                # Add realistic fire/smoke patterns
                if i % 2 == 0:  # Fire
                    # Red-orange fire region
                    y, x = np.random.randint(50, 400, 2)
                    w, h = np.random.randint(80, 200, 2)
                    img[y:y+h, x:x+w] = [0, 100, 255]  # Red-orange
                    class_id = 0  # Fire
                    # Normalized YOLO coordinates
                    x_center = (x + w/2) / 640
                    y_center = (y + h/2) / 640
                    width = w / 640
                    height = h / 640
                else:  # Smoke
                    # Gray smoke region with gradient
                    y, x = np.random.randint(50, 400, 2)
                    w, h = np.random.randint(100, 250, 2)
                    for dy in range(h):
                        alpha = 1 - (dy / h) * 0.7  # Fade effect
                        gray_val = int(80 + alpha * 60)
                        img[y+dy:y+dy+1, x:x+w] = [gray_val, gray_val, gray_val]
                    class_id = 1  # Smoke
                    x_center = (x + w/2) / 640
                    y_center = (y + h/2) / 640
                    width = w / 640
                    height = h / 640
                
                # Save image
                img_path = self.output_dir / split / 'images' / f'dummy_{i:03d}.jpg'
                cv2.imwrite(str(img_path), img)
                
                # Create label
                label_path = self.output_dir / split / 'labels' / f'dummy_{i:03d}.txt'
                with open(label_path, 'w') as f:
                    f.write(f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}\n")
        
        print("✅ Dummy dataset created!")
        return True

    def create_yaml_config(self):
        """Create YAML configuration file for YOLO training"""
        # Use absolute paths to avoid path issues
        train_path = str((self.output_dir / 'train' / 'images').absolute())
        val_path = str((self.output_dir / 'val' / 'images').absolute())
        
        config = {
            'train': train_path,
            'val': val_path,
            'nc': self.num_classes,
            'names': list(self.class_names.values())
        }
        
        yaml_path = self.output_dir / f'dfire_{self.mode}_config.yaml'
        with open(yaml_path, 'w') as f:
            yaml.dump(config, f, default_flow_style=False)
        
        print(f"✅ YAML config created: {yaml_path}")
        return yaml_path

    def get_augmentation_params(self):
        """Get augmentation parameters based on mode"""
        aug_configs = {
            'minimal': {
                'degrees': 0.0,
                'translate': 0.05,
                'scale': 0.1,
                'fliplr': 0.5,
                'mixup': 0.0,
                'copy_paste': 0.0
            },
            'moderate': {
                'degrees': 5.0,
                'translate': 0.1,
                'scale': 0.2,
                'fliplr': 0.5,
                'mixup': 0.05,
                'copy_paste': 0.05
            },
            'strong': {
                'degrees': 10.0,
                'translate': 0.2,
                'scale': 0.3,
                'fliplr': 0.5,
                'mixup': 0.1,
                'copy_paste': 0.1
            }
        }
        return aug_configs[self.config['augmentation']]

    def train_model(self):
        """
        Train YOLOv8 model with mode-specific configurations
        """
        config = self.config
        aug_params = self.get_augmentation_params()
        
        print(f"🚀 Starting {self.mode.upper()} mode training!")
        print(f"⚙️  Model: {config['model']}")
        print(f"⚙️  Epochs: {config['epochs']}, Image size: {config['imgsz']}, Batch: {config['batch_size']}")
        
        start_time = time.time()
        
        # Create YAML config
        yaml_path = self.create_yaml_config()
        
        # Initialize model
        print(f"📦 Loading {config['model']} model...")
        model = YOLO(config['model'])
        
        # Determine device
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"🖥️  Using device: {device}")
        
        # Training arguments
        train_args = {
            'data': str(yaml_path),
            'epochs': config['epochs'],
            'imgsz': config['imgsz'],
            'batch': config['batch_size'],
            'name': f'dfire_{self.mode}_train',
            'project': str(self.output_dir),
            'device': device,
            'patience': config['patience'],
            'save_period': 10 if self.mode == 'accurate' else -1,
            'workers': config['workers'],
            'exist_ok': True,
            'verbose': True,
            'plots': True,
            'val': True,
            'cache': config['cache'],
            'optimizer': 'AdamW',
            'lr0': 0.01,
            'warmup_epochs': 3 if self.mode != 'fast' else 0,
            'close_mosaic': 10,
            **aug_params
        }
        
        print("🔥 Starting training...")
        results = model.train(**train_args)
        
        elapsed_time = time.time() - start_time
        print(f"✅ Training completed in {elapsed_time:.1f} seconds ({elapsed_time/60:.1f} minutes)!")
        
        return results, elapsed_time

    def evaluate_model(self, conf_threshold=None):
        """Evaluate the trained model"""
        if conf_threshold is None:
            conf_threshold = {'fast': 0.1, 'balanced': 0.3, 'accurate': 0.5}[self.mode]
            
        print(f"🧪 Evaluating model (confidence threshold: {conf_threshold})...")
        
        # Find the trained model
        model_paths = [
            self.output_dir / f'dfire_{self.mode}_train' / 'weights' / 'best.pt',
            self.output_dir / f'dfire_{self.mode}_train' / 'weights' / 'last.pt'
        ]
        
        model_path = None
        for path in model_paths:
            if path.exists():
                model_path = path
                break
        
        if not model_path:
            print("❌ No trained model found!")
            return
        
        print(f"📦 Loading model: {model_path}")
        model = YOLO(str(model_path))
        
        # Test on validation images
        val_images = list((self.output_dir / 'val' / 'images').glob('*'))[:6]
        
        if not val_images:
            print("❌ No validation images found!")
            return
        
        print(f"🔮 Testing on {len(val_images)} images...")
        
        # Create subplot grid
        cols = 3
        rows = (len(val_images) + cols - 1) // cols
        fig, axes = plt.subplots(rows, cols, figsize=(15, 5 * rows))
        if rows == 1:
            axes = axes.reshape(1, -1) if len(val_images) > 1 else [axes]
        
        detection_count = 0
        total_confidence = 0
        
        for i, img_path in enumerate(val_images):
            row = i // cols
            col = i % cols
            ax = axes[row][col] if rows > 1 else axes[col]
            
            # Make prediction
            results = model.predict(str(img_path), conf=conf_threshold, verbose=False)
            
            # Load and display image
            img = cv2.imread(str(img_path))
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                
                # Draw predictions
                if len(results) > 0 and results[0].boxes is not None:
                    boxes = results[0].boxes
                    for j in range(len(boxes)):
                        x1, y1, x2, y2 = boxes.xyxy[j].cpu().numpy().astype(int)
                        conf = float(boxes.conf[j].cpu().numpy())
                        class_id = int(boxes.cls[j].cpu().numpy())
                        
                        detection_count += 1
                        total_confidence += conf
                        
                        # Color coding: red for fire, gray for smoke
                        color = (255, 0, 0) if class_id == 0 else (128, 128, 128)
                        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                        
                        label = f"{self.class_names[class_id]}: {conf:.2f}"
                        cv2.putText(img, label, (x1, y1-10), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                
                ax.imshow(img)
                ax.set_title(f"Test {i+1}: {img_path.name}")
                ax.axis('off')
        
        # Hide unused subplots
        for i in range(len(val_images), rows * cols):
            row = i // cols
            col = i % cols
            ax = axes[row][col] if rows > 1 else axes[col]
            ax.axis('off')
        
        plt.tight_layout()
        result_path = self.output_dir / f'{self.mode}_evaluation_results.png'
        plt.savefig(result_path, dpi=150, bbox_inches='tight')
        plt.show()
        
        # Print detection statistics
        avg_conf = total_confidence / max(detection_count, 1)
        print(f"📊 Found {detection_count} detections with average confidence: {avg_conf:.3f}")
        print(f"✅ Evaluation completed! Results saved to: {result_path}")

    def print_results_summary(self, training_time):
        """Print a comprehensive summary of training results"""
        print("\n" + "="*60)
        print(f"🎉 {self.mode.upper()} TRAINING SUMMARY")
        print("="*60)
        print(f"📁 Results saved in: {self.output_dir}")
        print(f"🏷️  Classes trained: {list(self.class_names.values())}")
        print(f"⏱️  Training time: {training_time/60:.1f} minutes")
        print(f"⚙️  Mode: {self.mode}")
        print(f"⚙️  Configuration: {self.config}")
        
        # Try to read training results
        results_csv = self.output_dir / f'dfire_{self.mode}_train' / 'results.csv'
        if results_csv.exists():
            try:
                df = pd.read_csv(results_csv)
                if len(df) > 0:
                    print(f"📊 Training epochs completed: {len(df)}")
                    
                    # Get final metrics
                    final_row = df.iloc[-1]
                    
                    # Check for different possible column names
                    map_columns = ['metrics/mAP50(B)', 'mAP50(B)', 'val/mAP50', 'mAP@0.5']
                    loss_columns = ['train/box_loss', 'box_loss', 'train_loss']
                    
                    for col in map_columns:
                        if col in df.columns:
                            final_map = final_row[col]
                            print(f"📈 Final mAP@0.5: {final_map:.3f}")
                            break
                    
                    for col in loss_columns:
                        if col in df.columns:
                            final_loss = final_row[col]
                            print(f"📉 Final box loss: {final_loss:.3f}")
                            break
                            
            except Exception as e:
                print(f"📊 Results file found but couldn't parse metrics: {e}")
        
        # Mode-specific recommendations
        if self.mode == 'fast':
            print("\n💡 FAST MODE NOTES:")
            print("   • Quick training for testing pipeline")
            print("   • Expected accuracy: 20-40%")
            print("   • For better results, try 'balanced' or 'accurate' mode")
        elif self.mode == 'balanced':
            print("\n💡 BALANCED MODE NOTES:")
            print("   • Good balance of speed and accuracy")
            print("   • Expected accuracy: 40-60%")
            print("   • Recommended for most use cases")
        else:  # accurate
            print("\n💡 ACCURATE MODE NOTES:")
            print("   • Maximum accuracy training")
            print("   • Expected accuracy: 60-80%")
            print("   • Best for production deployments")
        
        print(f"\n🚀 Model saved in: dfire_{self.mode}_train/weights/best.pt")
        print("="*60)


def install_requirements():
    """Check and install requirements"""
    try:
        import ultralytics
        import cv2
        import matplotlib
        import sklearn
        print("✅ All requirements already installed!")
        return True
    except ImportError as e:
        print(f"❌ Missing requirement: {e}")
        print("💡 Run: pip install ultralytics opencv-python matplotlib numpy scikit-learn")
        return False


def main():
    """Main training function with argument parsing"""
    parser = argparse.ArgumentParser(description='D-Fire Dataset Training Script')
    parser.add_argument('--mode', choices=['fast', 'balanced', 'accurate'], 
                       default='balanced', help='Training mode')
    parser.add_argument('--dataset', type=str, 
                       default="/Users/savirdillikar/aws-hack/drone-testing/D-Fire",
                       help='Path to D-Fire dataset')
    parser.add_argument('--output', type=str, default=None,
                       help='Output directory (default: ./dfire_{mode}_results)')
    
    args = parser.parse_args()
    
    if args.output is None:
        args.output = f"./dfire_{args.mode}_results"
    
    print(f"🔥 D-Fire Training Pipeline - {args.mode.upper()} Mode")
    print("=" * 60)
    
    # Check requirements
    if not install_requirements():
        print("❌ Please install requirements first!")
        return
    
    print(f"📁 Dataset path: {args.dataset}")
    print(f"📁 Output directory: {args.output}")
    
    # Check if dataset path exists
    if not Path(args.dataset).exists():
        print(f"❌ Dataset path not found: {args.dataset}")
        print("💡 Please check if the path is correct or use --dataset to specify the correct path")
        return
    
    # Initialize trainer
    trainer = DFireTrainer(args.dataset, args.output, args.mode)
    
    # Start training pipeline
    total_start = time.time()
    
    try:
        print("\n🔧 STEP 1: Setup directories...")
        trainer.setup_directory_structure()
        
        print("\n📊 STEP 2: Prepare dataset...")
        if not trainer.prepare_dataset():
            print("❌ Dataset preparation failed!")
            return
        
        print("\n🚀 STEP 3: Train model...")
        training_results, training_time = trainer.train_model()
        
        print("\n🧪 STEP 4: Evaluate model...")
        trainer.evaluate_model()
        
        # Total time
        total_time = time.time() - total_start
        print(f"\n⏱️ TOTAL PIPELINE TIME: {total_time:.1f} seconds ({total_time/60:.1f} minutes)")
        
        # Results summary
        trainer.print_results_summary(training_time)
        
        print(f"\n🎉 MISSION ACCOMPLISHED - {args.mode.upper()} MODE!")
        print(f"⏱️  Completed in {total_time/60:.1f} minutes.")
        
    except KeyboardInterrupt:
        print("\n⚠️ Training interrupted by user")
    except Exception as e:
        print(f"\n❌ Training failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()