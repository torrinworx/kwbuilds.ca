#!/bin/bash
set -euo pipefail

BUILD_DIR="./build"
ZIP_FILE="./build.zip"

# Clean previous build + zip
rm -rf "$BUILD_DIR"
rm -f "$ZIP_FILE"

# Frontend builds
npm run build:web
# vite build --config vite.config.ssg.js

# SSG step
# node ./destamatic-ui/ssg/build.js "$BUILD_DIR" ./frontend https://opengig.org

# Server
cp -R ./backend "$BUILD_DIR/backend"
cp -R ./destamatic-forge "$BUILD_DIR/destamatic-forge"
cp ./package.json "$BUILD_DIR/package.json"
cp ./package-lock.json "$BUILD_DIR/package-lock.json"

# Create run.sh inside build
cat << 'EOF' > "$BUILD_DIR/run.sh"
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. ~/.nvm/nvm.sh
nvm use 25
cd "$SCRIPT_DIR"
npm i --production
node "$SCRIPT_DIR/backend/index.js"
EOF

cp ./setup.sh "$BUILD_DIR/setup.sh"

chmod +x "$BUILD_DIR/run.sh"
chmod +x "$BUILD_DIR/setup.sh"

pushd "$BUILD_DIR" >/dev/null
zip -r "../$ZIP_FILE" .
popd >/dev/null

# Show sizes
du -sh "$BUILD_DIR"
du -sh "$ZIP_FILE"
