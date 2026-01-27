# Rust Setup for Tauri Desktop Builds

## Overview

The Nemo Instrument POC uses Tauri 2 for desktop deployment. Tauri requires Rust to build native desktop applications.

## Platform Requirements

### macOS Desktop Builds

**Rust is REQUIRED** for building macOS desktop applications locally.

**Why?**
- Tauri compiles to native macOS binaries using Rust
- Cross-compilation from Linux to macOS in Docker is complex and not officially supported
- Apple's SDK and toolchain have licensing restrictions

**Installation:**
```bash
# Install latest stable Rust (1.93+)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Restart terminal or source the environment
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

**Build macOS app:**
```bash
npm run tauri:build:macos
```

### Linux Desktop Builds

**Rust is NOT required** - use Docker instead!

**Why Docker?**
- Pre-configured Rust environment in container
- No local Rust installation needed
- Consistent build environment across machines

**Build Linux app:**
```bash
npm run tauri:build:linux
```

This creates `.deb` and `.AppImage` packages.

## Automated Setup

The project's setup script (`scripts/setup.sh`) automatically:
1. Checks if Rust is installed
2. Displays current Rust version if installed
3. Compares against project's required version (1.75)
4. Offers to install Rust if missing
5. Provides guidance on build options

**Run setup:**
```bash
npm run setup
```

## Version Requirements

- **Project Rust Version**: Latest stable (1.93+) - required for Tauri 2 and edition2024 features
- **Tauri Version**: 2.x
- **Node.js Version**: 24 LTS

## Troubleshooting

### "cargo metadata" Error

**Error:**
```
failed to run 'cargo metadata' command
No such file or directory (os error 2)
```

**Solution:**
Rust is not installed. Install it:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Version Mismatch Warning

If you see a version mismatch warning during setup:
```bash
# Update Rust to latest stable
rustup update stable
rustup default stable

# Verify version
rustc --version
```

### macOS System Dependencies

Tauri also requires Xcode Command Line Tools:
```bash
xcode-select --install
```

## Build Options Summary

| Platform | Method | Rust Required? | Command                                  |
|----------|--------|----------------|------------------------------------------|
| macOS    | Local  | ✅ Yes         | `npm run tauri:build:macos`              |
| Linux    | Docker | ❌ No          | `npm run tauri:build:linux`              |
| Windows  | Local  | ✅ Yes         | `npm run tauri:build` (on Windows)       |

## CI/CD Considerations

For automated builds:
- **macOS**: Use GitHub Actions macOS runners with Rust pre-installed
- **Linux**: Use Docker-based builds (no Rust setup needed)
- **Windows**: Use GitHub Actions Windows runners with Rust pre-installed

## Additional Resources

- [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)
- [Rust Installation Guide](https://www.rust-lang.org/tools/install)
- [Rustup Documentation](https://rust-lang.github.io/rustup/)
