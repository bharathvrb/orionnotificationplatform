#!/bin/bash

# Script to rerun React Native app with clean build
# Usage: ./rerun-react-native.sh [path-to-react-native-project]

if [ -z "$1" ]; then
    echo "📱 React Native App Rerun Script"
    echo "================================"
    echo ""
    echo "Usage: ./rerun-react-native.sh /path/to/your/react-native-project"
    echo ""
    echo "Or if your React Native project is in a common location:"
    echo "  ./rerun-react-native.sh ~/Github/AapthaMithra"
    echo ""
    exit 1
fi

RN_PROJECT="$1"

if [ ! -d "$RN_PROJECT" ]; then
    echo "❌ Error: Directory not found: $RN_PROJECT"
    exit 1
fi

if [ ! -d "$RN_PROJECT/android" ] && [ ! -d "$RN_PROJECT/ios" ]; then
    echo "❌ Error: This doesn't appear to be a React Native project"
    exit 1
fi

echo "🚀 Rerunning React Native app..."
echo "Project: $RN_PROJECT"
echo ""

cd "$RN_PROJECT"

# Stop any running Metro bundler
echo "1. Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true
sleep 2

# Clean Android build
if [ -d "android" ]; then
    echo "2. Cleaning Android build..."
    cd android
    ./gradlew clean
    cd ..
fi

# Clear caches
echo "3. Clearing caches..."
rm -rf node_modules/.cache 2>/dev/null || true
watchman watch-del-all 2>/dev/null || true

echo "4. Starting Metro bundler with reset cache..."
echo "   (This will run in the background)"
npx react-native start --reset-cache > /dev/null 2>&1 &
METRO_PID=$!
sleep 5

echo "5. Building and running Android app..."
echo "   (This may take a few minutes)"
npx react-native run-android

echo ""
echo "✅ App should be running now!"
echo ""
echo "To stop Metro bundler, run: kill $METRO_PID"
echo "Or press Ctrl+C in the Metro terminal"




