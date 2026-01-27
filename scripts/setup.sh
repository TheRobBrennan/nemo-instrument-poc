#!/bin/bash
set -e

echo "🚀 Nemo Instrument POC - Setup Script"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check for Rust installation (required for macOS Tauri desktop builds)
# Tauri 2 requires latest stable Rust (1.93+) for edition2024 features
RUST_REQUIRED_VERSION="stable"
RUST_INSTALLED=false

# Try to source cargo env first in case it's already installed but not in PATH
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

if command -v rustc &> /dev/null; then
    RUST_INSTALLED=true
    RUST_VERSION=$(rustc --version | awk '{print $2}')
    echo "✅ Rust is installed: $RUST_VERSION"
    
    # Check if it's the latest stable by comparing with rustup
    if command -v rustup &> /dev/null; then
        CURRENT_CHANNEL=$(rustup show active-toolchain | awk '{print $1}')
        if [[ ! "$CURRENT_CHANNEL" =~ ^stable ]]; then
            echo "⚠️  Project requires latest stable Rust, you have $CURRENT_CHANNEL"
            echo ""
            read -p "   Would you like to update to stable Rust? (y/N) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "📦 Updating to stable Rust..."
                rustup update stable
                rustup default stable
                RUST_VERSION=$(rustc --version | awk '{print $2}')
                echo "✅ Switched to Rust $RUST_VERSION"
                echo ""
                echo "⚠️  IMPORTANT: Restart your terminal or run: source \$HOME/.cargo/env"
                echo "   This is required for cargo to be available in your PATH"
            else
                echo "⏭️  Continuing with Rust $RUST_VERSION"
                echo "   Note: This may cause compatibility issues"
                echo "   To switch later: rustup update stable && rustup default stable"
            fi
        fi
    fi
else
    echo "⚠️  Rust is not installed"
    echo ""
    echo "   Rust is required for building the Tauri desktop application on macOS."
    echo "   Note: Linux builds can use Docker (no Rust required)"
    echo ""
    read -p "   Would you like to install Rust now? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 Installing latest stable Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
        
        # Source the cargo environment to make rust available in this script
        if [ -f "$HOME/.cargo/env" ]; then
            source "$HOME/.cargo/env"
        fi
        
        # Check if installation succeeded
        if command -v rustc &> /dev/null; then
            RUST_INSTALLED=true
            RUST_VERSION=$(rustc --version | awk '{print $2}')
            echo "✅ Rust $RUST_VERSION installed successfully"
            echo ""
            echo "⚠️  IMPORTANT: Restart your terminal or run: source \$HOME/.cargo/env"
            echo "   This is required for cargo to be available in your PATH"
        else
            echo "⚠️  Rust installation completed but not detected in PATH"
            echo "   Please restart your terminal and run: source \$HOME/.cargo/env"
        fi
    else
        echo "⏭️  Skipping Rust installation"
        echo "   You can install it later with: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        echo "   For now, you can:"
        echo "   - Use the web version (Docker): npm start"
        echo "   - Build Linux desktop app (Docker): npm run tauri:build:linux"
    fi
fi
echo ""

# Create .env file if it doesn't exist
if [ ! -f docker/.env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp docker/.env.example docker/.env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi
echo ""

# Check if npm workspaces are set up
if [ -f package.json ]; then
    echo "✅ Root package.json found"
else
    echo "❌ Root package.json not found"
    exit 1
fi
echo ""

echo "🎉 Setup complete!"
echo ""

# Check if Rust was just installed/switched and remind about sourcing
if [ "$RUST_INSTALLED" = true ] && [ -f "$HOME/.cargo/env" ]; then
    # Check if cargo is in PATH
    if ! command -v cargo &> /dev/null; then
        echo "⚠️  IMPORTANT: Run this command to activate Rust in your current terminal:"
        echo "   source \$HOME/.cargo/env"
        echo ""
        echo "   Or restart your terminal for it to take effect automatically."
        echo ""
    fi
fi

echo "Next steps:"
echo "  1. Start the application: npm start"
echo "  2. Or build and start: npm run start:clean"
echo "  3. View logs: npm run docker:logs"
echo ""
echo "Desktop builds:"
if [ "$RUST_INSTALLED" = true ]; then
    echo "  - macOS desktop app: npm run tauri:build:macos (Rust installed ✅)"
else
    echo "  - macOS desktop app: npm run tauri:build:macos (requires Rust ⚠️)"
fi
echo "  - Linux desktop app: npm run tauri:build:linux (Docker, no Rust needed)"
echo ""
echo "Note: Docker Compose file is located at docker/docker-compose.yml"
echo ""
echo "Access points:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend Health: http://localhost:3001/health"
echo "  - WebSocket: ws://localhost:8080"
echo ""
