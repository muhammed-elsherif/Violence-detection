#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install required packages
echo "Installing required packages..."
pip install pyinstaller schedule face_recognition opencv-python pandas numpy

# Create dist directory
echo "Creating distribution directory..."
rm -rf dist
mkdir -p dist

# Package the application
echo "Packaging application..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Building for macOS..."
    pyinstaller --name=Attendance-System --onefile --windowed attendance_app_enchancmed_ui.py

    # Create DMG if create-dmg is installed
    if command -v create-dmg &> /dev/null; then
        echo "Creating DMG installer..."
        # Create a temporary directory for DMG creation
        TEMP_DMG_DIR=$(mktemp -d)
        
        # Copy the .app to the temp directory
        cp -R "dist/Attendance-System.app" "$TEMP_DMG_DIR/"
        
        # Create DMG with minimal Finder interaction
        create-dmg \
            --volname "Attendance System" \
            --window-pos 200 120 \
            --window-size 800 400 \
            --icon-size 100 \
            --icon "Attendance-System.app" 200 190 \
            --hide-extension "Attendance-System.app" \
            --app-drop-link 600 185 \
            --no-internet-enable \
            --skip-jenkins \
            "dist/Attendance-System-1.0.0-mac.dmg" \
            "$TEMP_DMG_DIR"
            
        # Clean up
        rm -rf "$TEMP_DMG_DIR"
        
        if [ -f "dist/Attendance-System-1.0.0-mac.dmg" ]; then
            echo "DMG created successfully"
        else
            echo "DMG creation failed, but .app bundle is available"
        fi
    else
        echo "create-dmg not found. Skipping DMG creation."
        echo "The .app bundle is available in the dist directory."
    fi
    
    # Create a zip archive as a fallback
    echo "Creating zip archive..."
    cd dist
    zip -r "Attendance-System-1.0.0-mac.zip" "Attendance-System.app"
    cd ..
    
else
    # Windows
    echo "Building for Windows..."
    pyinstaller \
        --name=Attendance-System \
        --windowed \
        --onefile \
        --add-data=attendance_config.json;. \
        --add-data=attendance_state.json;. \
        attendance_app_enchancmed_ui.py

    # Rename the executable
    mv "dist/Attendance-System.exe" "dist/Attendance-System-1.0.0-win.exe"
fi

echo "Build completed successfully!"
echo "Output files are in the dist directory:"
ls -l dist/

# Verify the build
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "dist/Attendance-System.app" ]; then
        echo "✅ macOS .app bundle created successfully"
    fi
    if [ -f "dist/Attendance-System-1.0.0-mac.dmg" ]; then
        echo "✅ macOS DMG created successfully"
    fi
    if [ -f "dist/Attendance-System-1.0.0-mac.zip" ]; then
        echo "✅ macOS ZIP archive created successfully"
    fi
else
    if [ -f "dist/Attendance-System-1.0.0-win.exe" ]; then
        echo "✅ Windows executable created successfully"
    fi
fi 