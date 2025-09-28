#!/usr/bin/env python3
"""
Analyze multiple drone images at once using GPT-4 Vision
"""

IMAGES_DIR = "/Users/savirdillikar/aws-hack/drone-testing/fire_scout_mission_20250927_135049/"
# OpenAI API key should be set via environment variable
#!/usr/bin/env python3
"""
Drone Image Analysis Server with Flask
Provides endpoints for analyzing drone images using GPT-4 Vision
"""

import base64
import os
import requests
import json
from pathlib import Path
from flask import Flask, request, jsonify, render_template_string
from werkzeug.utils import secure_filename
import tempfile
import shutil
from datetime import datetime
import logging
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
CORS(app)  # Enable CORS for all routes

# --- CONFIG ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}
UPLOAD_FOLDER = tempfile.mkdtemp(prefix="drone_uploads_")

if not OPENAI_API_KEY:
    logger.warning("OpenAI API key not set. Please set OPENAI_API_KEY environment variable.")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def encode_image_base64(image_path):
    """Encode image to base64 string"""
    try:
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        logger.error(f"Error encoding image {image_path}: {e}")
        raise

def analyze_images_with_gpt4(image_paths, custom_prompt=None):
    """Analyze images using GPT-4 Vision"""
    if not OPENAI_API_KEY:
        raise ValueError("OpenAI API key not configured")
    
    if not image_paths:
        raise ValueError("No images provided for analysis")

    # Default prompt for fire/smoke detection
    default_prompt = """
    These are drone images for fire/smoke detection. The images may contain colored YOLO detection boxes:
    - RED = fire
    - GRAY = smoke  
    - BLUE = people
    Provide ONE consolidated emergency response report for all images:
    1. Detection boxes visible and locations
    2. Actual fire/smoke presence, severity, direction, and movement
    3. People and safety assessment with approximate locations. Talk specefic how many people where are they like on top of something
    4. Recommended immediate actions
    5. Tactical info: wind, terrain, access routes
    """
    
    prompt = custom_prompt or default_prompt

    # Build message content with all images (limit to 5 images max)
    content_list = [{"type": "text", "text": prompt}]
    
    for img_path in image_paths[:5]:  # Limit to 5 images
        try:
            image_base64 = encode_image_base64(img_path)
            content_list.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
            })
        except Exception as e:
            logger.error(f"Failed to encode image {img_path}: {e}")
            continue

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": content_list}],
        "max_tokens": 2000,
        "temperature": 0.1
    }

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        else:
            logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
            raise RuntimeError(f"OpenAI API request failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {e}")
        raise RuntimeError(f"API request failed: {e}")

# --- ROUTES ---

@app.route('/')
def index():
    """Landing page with API documentation"""
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Drone Image Analysis API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .endpoint { background: #f4f4f4; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .method { color: #fff; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
            .get { background: #4CAF50; }
            .post { background: #2196F3; }
            pre { background: #f9f9f9; padding: 10px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>🚁 Drone Image Analysis API</h1>
        <p>AI-powered fire and smoke detection service for drone imagery</p>
        
        <h2>Available Endpoints</h2>
        
        <div class="endpoint">
            <h3><span class="method get">GET</span> /health</h3>
            <p>Check server health and configuration status</p>
        </div>
        
        <div class="endpoint">
            <h3><span class="method post">POST</span> /analyze/upload</h3>
            <p>Upload and analyze drone images</p>
            <strong>Body:</strong> multipart/form-data with image files
            <br><strong>Optional:</strong> custom_prompt parameter
        </div>
        
        <div class="endpoint">
            <h3><span class="method post">POST</span> /analyze/directory</h3>
            <p>Analyze images from a server directory</p>
            <strong>Body:</strong> JSON with directory_path and optional custom_prompt
        </div>
        
        <div class="endpoint">
            <h3><span class="method post">POST</span> /analyze/urls</h3>
            <p>Analyze images from URLs</p>
            <strong>Body:</strong> JSON with image_urls array and optional custom_prompt
        </div>
        
        <h2>Example Usage</h2>
        <pre>
# Upload files
curl -X POST http://localhost:5000/analyze/upload \
  -F "images=@drone1.jpg" \
  -F "images=@drone2.jpg" \
  -F "custom_prompt=Analyze these for forest fire detection"

# Analyze directory  
curl -X POST http://localhost:5000/analyze/directory \
  -H "Content-Type: application/json" \
  -d '{"directory_path": "/path/to/images", "custom_prompt": "Custom analysis prompt"}'
        </pre>
    </body>
    </html>
    """
    return html_template

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "openai_configured": bool(OPENAI_API_KEY),
        "upload_folder": UPLOAD_FOLDER,
        "max_file_size": app.config['MAX_CONTENT_LENGTH']
    })

@app.route('/analyze/upload', methods=['POST'])
def analyze_uploaded_images():
    """Analyze uploaded image files"""
    try:
        # Check if files were uploaded
        if 'images' not in request.files:
            return jsonify({"error": "No image files provided"}), 400
        
        files = request.files.getlist('images')
        if not files or all(f.filename == '' for f in files):
            return jsonify({"error": "No files selected"}), 400
        
        # Get custom prompt if provided
        custom_prompt = request.form.get('custom_prompt')
        
        # Save uploaded files temporarily
        saved_paths = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                unique_filename = f"{timestamp}_{filename}"
                filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(filepath)
                saved_paths.append(filepath)
        
        if not saved_paths:
            return jsonify({"error": "No valid image files provided"}), 400
        
        # Analyze images
        analysis = analyze_images_with_gpt4(saved_paths, custom_prompt)
        
        # Clean up uploaded files
        for path in saved_paths:
            try:
                os.remove(path)
            except Exception as e:
                logger.warning(f"Failed to delete temp file {path}: {e}")
        
        return jsonify({
            "success": True,
            "images_analyzed": len(saved_paths),
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_uploaded_images: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze/directory', methods=['POST'])
def analyze_directory_images():
    """Analyze images from a specified directory"""
    try:
        data = request.get_json()
        if not data or 'directory_path' not in data:
            return jsonify({"error": "directory_path required in JSON body"}), 400
        
        directory_path = data['directory_path']
        if not isinstance(directory_path, str) or not directory_path:
            directory_path = "/Users/savirdillikar/aws-hack/drone-testing/enhanced_scout_20250927_172148"
        custom_prompt = data.get('custom_prompt')
        
        if not os.path.exists(directory_path):
            return jsonify({"error": f"Directory not found: {directory_path}"}), 404
        
        # Find image files
        image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp', '*.webp']
        image_files = []
        
        for ext in image_extensions:
            image_files.extend(Path(directory_path).glob(ext))
            image_files.extend(Path(directory_path).glob(ext.upper()))
        
        if not image_files:
            return jsonify({"error": "No image files found in directory"}), 404
        
        # Convert to strings and limit
        image_paths = [str(p) for p in image_files[:3]]  # Limit to 10 images
        
        # Analyze images
        analysis = analyze_images_with_gpt4(image_paths, custom_prompt)
        
        return jsonify({
            "success": True,
            "directory": directory_path,
            "images_found": len(image_files),
            "images_analyzed": len(image_paths),
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_directory_images: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze/urls', methods=['POST'])
def analyze_image_urls():
    """Analyze images from URLs"""
    try:
        data = request.get_json()
        if not data or 'image_urls' not in data:
            return jsonify({"error": "image_urls array required in JSON body"}), 400
        
        image_urls = data['image_urls']
        custom_prompt = data.get('custom_prompt')
        
        if not isinstance(image_urls, list) or not image_urls:
            return jsonify({"error": "image_urls must be a non-empty array"}), 400
        
        # Download images temporarily
        saved_paths = []
        for i, url in enumerate(image_urls[:5]):  # Limit to 5 URLs
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                
                # Save to temp file
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{timestamp}_url_{i}.jpg"
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                saved_paths.append(filepath)
                
            except Exception as e:
                logger.warning(f"Failed to download image from {url}: {e}")
                continue
        
        if not saved_paths:
            return jsonify({"error": "Failed to download any images from provided URLs"}), 400
        
        # Analyze images
        analysis = analyze_images_with_gpt4(saved_paths, custom_prompt)
        
        # Clean up downloaded files
        for path in saved_paths:
            try:
                os.remove(path)
            except Exception as e:
                logger.warning(f"Failed to delete temp file {path}: {e}")
        
        return jsonify({
            "success": True,
            "urls_provided": len(image_urls),
            "images_analyzed": len(saved_paths),
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_image_urls: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 50MB"}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    logger.info(f"Starting Drone Image Analysis Server...")
    logger.info(f"Upload folder: {UPLOAD_FOLDER}")
    logger.info(f"OpenAI API configured: {bool(OPENAI_API_KEY)}")
    
    # Create upload folder if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=2134)