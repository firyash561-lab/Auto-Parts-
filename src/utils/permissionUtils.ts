import { Capacitor } from "@capacitor/core";
import { Camera } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";

export interface PermissionResult {
  granted: boolean;
  deniedPermanently?: boolean;
  message?: string;
}

/**
 * Request camera permission JIT (Just-In-Time) when user explicitly taps "Add Photo" or "Open Camera".
 * Never called on app startup or background resume.
 */
export async function requestCameraPermissionJIT(): Promise<PermissionResult> {
  if (Capacitor.isNativePlatform()) {
    try {
      const check = await Camera.checkPermissions();
      if (check.camera === "granted" && check.photos === "granted") {
        return { granted: true };
      }

      if (check.camera === "denied" || check.photos === "denied") {
        // Request permissions from native Android OS
        const req = await Camera.requestPermissions();
        if (req.camera === "granted" || req.photos === "granted") {
          return { granted: true };
        }
        return {
          granted: false,
          deniedPermanently: true,
          message: "Camera & Photos permission is needed to attach spare part images. Please grant permission in Android Settings or retry."
        };
      }

      // Prompt user
      const req = await Camera.requestPermissions();
      if (req.camera === "granted" || req.photos === "granted") {
        return { granted: true };
      }

      return {
        granted: false,
        message: "Camera permission was not granted. Photos cannot be added without permission."
      };
    } catch (e: any) {
      console.warn("Native Camera permission request fallback:", e);
      return { granted: true };
    }
  }

  // Web platform: permission requested by browser automatically on input file picker trigger
  return { granted: true };
}

/**
 * Request location permission JIT (Just-In-Time) when user explicitly taps "Use Current Location" or "My GPS".
 * Never called on app startup or background resume.
 */
export async function requestLocationPermissionJIT(): Promise<{
  granted: boolean;
  coords?: { lat: number; lng: number };
  message?: string;
  canOpenSettings?: boolean;
}> {
  if (Capacitor.isNativePlatform()) {
    try {
      const check = await Geolocation.checkPermissions();
      if (check.location !== "granted" && check.coarseLocation !== "granted") {
        const req = await Geolocation.requestPermissions();
        if (req.location !== "granted" && req.coarseLocation !== "granted") {
          return {
            granted: false,
            canOpenSettings: true,
            message: "Location permission is required to detect your current position. Please enable location permission in Android App Settings."
          };
        }
      }

      // Fetch position with timeout
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        granted: true,
        coords: {
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6))
        }
      };
    } catch (err: any) {
      console.warn("Native Geolocation error:", err);
      return {
        granted: false,
        message: "Unable to retrieve GPS coordinates. Please ensure GPS/Location service is turned on in your device system settings."
      };
    }
  }

  // Web browser fallback
  return new Promise((resolve) => {
    // Detect iframe preview limitation
    const isIframe = typeof window !== "undefined" && window.self !== window.top;
    if (isIframe) {
      resolve({
        granted: false,
        message: "Current GPS location is unavailable in Preview iframe. Please test on a real mobile device or select location on the map."
      });
      return;
    }

    if (!navigator.geolocation) {
      resolve({
        granted: false,
        message: "Geolocation is not supported by your browser."
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          granted: true,
          coords: {
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6))
          }
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({
            granted: false,
            canOpenSettings: true,
            message: "Location permission was denied. Please allow location access in browser/device settings to use GPS pinpointing."
          });
        } else {
          resolve({
            granted: false,
            message: "Could not fetch GPS coordinates. You can still select your state & district manually or drop a pin on the map."
          });
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}
