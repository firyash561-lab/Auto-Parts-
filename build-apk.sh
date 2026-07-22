#!/bin/bash
set -e

LOG_FILE="/app/applet/android_build.log"
exec > >(tee -i "$LOG_FILE") 2>&1

echo "=== [$(date)] Starting Android SDK Setup and Build ==="

echo "=== 0. Setting up JDK 21 ==="
if [ ! -d /opt/jdk-21 ]; then
    echo "Downloading JDK 21..."
    curl -L -o /tmp/openjdk-21.tar.gz "https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/adoptium?project=jdk"
    mkdir -p /opt/jdk-21
    tar -xzf /tmp/openjdk-21.tar.gz -C /opt/jdk-21 --strip-components=1
    rm -f /tmp/openjdk-21.tar.gz
fi

export JAVA_HOME=/opt/jdk-21
export PATH=$JAVA_HOME/bin:$PATH

echo "Using Java Home: $JAVA_HOME"
java -version

echo "=== 1. Creating directories ==="
mkdir -p /opt/android-sdk/cmdline-tools

echo "=== 2. Downloading and Extracting Command Line Tools ==="
if [ ! -f /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager ]; then
    echo "Downloading cmdline-tools..."
    rm -f /tmp/cmdline-tools.zip
    curl -sSL -o /tmp/cmdline-tools.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    echo "=== 3. Extracting Command Line Tools ==="
    rm -rf /opt/android-sdk/cmdline-tools/latest
    rm -rf /tmp/cmdline-tools-extracted
    unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-tools-extracted
    mkdir -p /opt/android-sdk/cmdline-tools/latest
    mv /tmp/cmdline-tools-extracted/cmdline-tools/* /opt/android-sdk/cmdline-tools/latest/
    rm -rf /tmp/cmdline-tools-extracted /tmp/cmdline-tools.zip
else
    echo "Command Line Tools already installed at /opt/android-sdk/cmdline-tools/latest."
fi

echo "=== 4. Setting up SDK Paths ==="
export PATH=/opt/android-sdk/cmdline-tools/latest/bin:$PATH

echo "=== 5. Accepting SDK Licenses ==="
yes | sdkmanager --sdk_root=/opt/android-sdk --licenses

echo "=== 6. Installing SDK Packages ==="
yes | sdkmanager --sdk_root=/opt/android-sdk "platform-tools" "platforms;android-36" "build-tools;35.0.0"

echo "=== 7. Writing local.properties ==="
echo "sdk.dir=/opt/android-sdk" > /app/applet/android/local.properties

echo "=== 8. Checking Node and NPM ==="
node -v
npm -v

echo "=== 9. Building React Web Assets ==="
npm run build

echo "=== 10. Syncing Web Assets to Android ==="
npx cap sync android

echo "=== 10.5 Regenerating Gradle Wrapper correctly ==="
if [ ! -f /tmp/gradle-8.14.3/bin/gradle ]; then
    echo "Downloading Gradle 8.14.3..."
    rm -f /tmp/gradle-8.14.3-bin.zip
    curl -L --retry 5 --retry-connrefused -o /tmp/gradle-8.14.3-bin.zip "https://services.gradle.org/distributions/gradle-8.14.3-bin.zip"
    rm -rf /tmp/gradle-8.14.3
    unzip -q /tmp/gradle-8.14.3-bin.zip -d /tmp/
    rm -f /tmp/gradle-8.14.3-bin.zip
fi
rm -f android/gradle/wrapper/gradle-wrapper.jar
/tmp/gradle-8.14.3/bin/gradle wrapper --gradle-version 8.14.3 --project-dir android --no-daemon

echo "=== 11. Building Debug APK ==="
chmod +x ./android/gradlew
./android/gradlew -p android assembleDebug --no-daemon

echo "=== 12. Building Release APK ==="
./android/gradlew -p android assembleRelease --no-daemon

echo "=== 13. Verifying and Listing Generated APKs ==="
find android -name "*.apk" -ls
cp android/app/build/outputs/apk/debug/app-debug.apk ./ || echo "Could not copy debug APK"
cp android/app/build/outputs/apk/release/app-release-unsigned.apk ./ || cp android/app/build/outputs/apk/release/app-release.apk ./ || echo "Could not copy release APK"

echo "=== [$(date)] Android Build Complete! ==="
