#!/usr/bin/env python3
"""
UFDR 3D Visualization Setup Script
Installs and configures the Python dependencies for 3D visualization.
Run via: npm run setup-visualization
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    
    print(f"✅ Python version {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_dependencies():
    """Install Python dependencies"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    requirements_file = os.path.join(script_dir, 'requirements_visualization.txt')
    
    if not os.path.exists(requirements_file):
        print(f"❌ Requirements file not found: {requirements_file}")
        return False
    
    # Upgrade pip first
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install requirements
    if not run_command(f"{sys.executable} -m pip install -r {requirements_file}", "Installing visualization dependencies"):
        return False
    
    return True

def test_imports():
    """Test if all required packages can be imported"""
    packages = [
        'numpy',
        'plotly',
        'pandas',
        'scipy',
        'sklearn'
    ]
    
    print("🧪 Testing package imports...")
    failed_imports = []
    
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError as e:
            print(f"❌ {package}: {e}")
            failed_imports.append(package)
    
    if failed_imports:
        print(f"\n❌ Failed to import: {', '.join(failed_imports)}")
        return False
    
    print("✅ All packages imported successfully")
    return True

def test_visualization_script():
    """Test the visualization script with sample data"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    script_path = os.path.join(script_dir, 'ufdr_3d_visualizer.py')
    
    if not os.path.exists(script_path):
        print(f"❌ Visualization script not found: {script_path}")
        return False
    
    # Create sample data for testing
    sample_data = {
        "chats": [
            {
                "contact": "Test Contact",
                "message": "Test message",
                "platform": "WhatsApp",
                "timestamp": "2024-01-15T10:00:00Z",
                "location": "Test Location"
            }
        ],
        "calls": [
            {
                "contact": "Test Contact",
                "type": "incoming",
                "duration": 120,
                "timestamp": "2024-01-15T10:30:00Z",
                "location": "Test Location"
            }
        ],
        "images": [],
        "videos": [],
        "appData": []
    }
    
    import json
    import tempfile
    
    # Create temporary file with sample data
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(sample_data, f)
        temp_file = f.name
    
    try:
        # Test the script
        result = subprocess.run(
            [sys.executable, script_path, temp_file, 'comprehensive'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("✅ Visualization script test passed")
            return True
        else:
            print(f"❌ Visualization script test failed:")
            print(f"Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Visualization script test timed out")
        return False
    except Exception as e:
        print(f"❌ Visualization script test failed: {e}")
        return False
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file)
        except OSError:
            pass

def main():
    """Main setup function"""
    print("🚀 UFDR 3D Visualization Setup")
    print("=" * 50)
    
    # Check system information
    print(f"Platform: {platform.system()} {platform.release()}")
    print(f"Python: {sys.executable}")
    print()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Setup failed during dependency installation")
        sys.exit(1)
    
    # Test imports
    if not test_imports():
        print("\n❌ Setup failed during import testing")
        sys.exit(1)
    
    # Test visualization script
    if not test_visualization_script():
        print("\n❌ Setup failed during script testing")
        sys.exit(1)
    
    print("\n🎉 UFDR 3D Visualization setup completed successfully!")
    print("\nNext steps:")
    print("1. Install Node.js dependencies: npm install")
    print("2. Start the development server: npm run dev")
    print("3. Navigate to /ufdr-3d-visualization in your browser")
    print("\nFor more information, see docs/UFDR_3D_VISUALIZATION_GUIDE.md")

if __name__ == '__main__':
    main()

