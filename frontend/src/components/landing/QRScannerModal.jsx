import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, AlertCircle, Upload, RefreshCw } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import GlassCard from "../ui/GlassCard.jsx";
import Button from "../ui/Button.jsx";

export default function QRScannerModal({ open, onClose, onScanSuccess }) {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);

  const scannerRef = useRef(null);
  const isMountedRef = useRef(true);
  const startPromiseRef = useRef(null);
  const stopPromiseRef = useRef(null);
  const hasScannedRef = useRef(false);
  const selectedCameraIdRef = useRef("");

  // Helper to identify back/environment camera from device list
  const findBackCamera = (deviceList) => {
    if (!deviceList || deviceList.length === 0) return null;
    const backKeywords = ["back", "rear", "environment", "main", "wide", "facing back", "0, facing back"];
    
    // First, check explicit label matches
    const matched = deviceList.find((device) => {
      const label = (device.label || "").toLowerCase();
      return backKeywords.some((keyword) => label.includes(keyword));
    });
    if (matched) return matched;

    // If multiple devices exist and no explicit back label, usually index > 0 is back camera on mobile
    if (deviceList.length > 1) {
      return deviceList[deviceList.length - 1];
    }

    return deviceList[0];
  };

  const stopScannerSafely = async () => {
    if (stopPromiseRef.current) {
      try {
        await stopPromiseRef.current;
      } catch (e) {}
    }
    if (startPromiseRef.current) {
      try {
        await startPromiseRef.current;
      } catch (e) {}
    }

    if (scannerRef.current) {
      const instance = scannerRef.current;
      if (instance.isScanning) {
        try {
          const stopPromise = instance.stop();
          stopPromiseRef.current = stopPromise;
          await stopPromise;
          stopPromiseRef.current = null;
        } catch (e) {
          console.warn("Error stopping scanner:", e);
        }
      }
      try {
        instance.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
  };

  const startCamera = async () => {
    if (!isMountedRef.current) return;
    setError(null);
    hasScannedRef.current = false;

    try {
      await stopScannerSafely();

      const element = document.getElementById("qr-reader");
      if (!element) {
        console.warn("DOM element #qr-reader not found");
        return;
      }

      // 1. Fetch available cameras first if not already fetched
      let availableCameras = cameras;
      if (availableCameras.length === 0) {
        try {
          availableCameras = await Html5Qrcode.getCameras();
          if (isMountedRef.current) {
            setCameras(availableCameras);
          }
        } catch (e) {
          console.warn("Could not enumerate camera devices before start:", e);
        }
      }

      // 2. Determine target camera ID or fallback constraint
      let cameraConfig;
      if (selectedCameraIdRef.current) {
        cameraConfig = selectedCameraIdRef.current;
      } else if (availableCameras && availableCameras.length > 0) {
        const preferredBack = findBackCamera(availableCameras);
        if (preferredBack) {
          cameraConfig = preferredBack.id;
          selectedCameraIdRef.current = preferredBack.id;
          const idx = availableCameras.findIndex((c) => c.id === preferredBack.id);
          if (idx !== -1 && isMountedRef.current) {
            setActiveCameraIndex(idx);
          }
        } else {
          cameraConfig = { facingMode: "environment" };
        }
      } else {
        cameraConfig = { facingMode: "environment" };
      }

      // 3. Create fresh scanner instance
      scannerRef.current = new Html5Qrcode("qr-reader");
      const html5QrCode = scannerRef.current;

      const config = {
        fps: 20,
        qrbox: (width, height) => {
          const size = Math.min(width, height) * 0.75;
          return { width: Math.max(size, 150), height: Math.max(size, 150) };
        },
        aspectRatio: 1.0,
      };

      const startPromise = html5QrCode.start(
        cameraConfig,
        config,
        async (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          try {
            await stopScannerSafely();
          } catch (err) {
            console.error("Stop failed on success:", err);
          } finally {
            if (isMountedRef.current) {
              setScanning(false);
            }
            onScanSuccess(decodedText);
            onClose();
          }
        },
        undefined
      );

      startPromiseRef.current = startPromise;
      await startPromise;
      startPromiseRef.current = null;

      if (isMountedRef.current) {
        setScanning(true);
      }

      // Update camera index if track settings are available
      try {
        const trackSettings = html5QrCode.getRunningTrackSettings();
        if (trackSettings?.deviceId && availableCameras.length > 0) {
          const activeCam = availableCameras.find((cam) => cam.id === trackSettings.deviceId);
          if (activeCam && isMountedRef.current) {
            const idx = availableCameras.indexOf(activeCam);
            setActiveCameraIndex(idx);
            selectedCameraIdRef.current = activeCam.id;
          }
        }
      } catch (e) {}
    } catch (err) {
      console.error("Camera failed to start with primary config:", err);
      try {
        if (scannerRef.current) {
          scannerRef.current = new Html5Qrcode("qr-reader");
          const fallbackConfig = { facingMode: "environment" };
          const fallbackPromise = scannerRef.current.start(
            fallbackConfig,
            { fps: 15, aspectRatio: 1.0 },
            (text) => {
              onScanSuccess(text);
              onClose();
            },
            undefined
          );
          startPromiseRef.current = fallbackPromise;
          await fallbackPromise;
          startPromiseRef.current = null;
          if (isMountedRef.current) setScanning(true);
          return;
        }
      } catch (fallbackErr) {
        console.error("Fallback camera start failed:", fallbackErr);
      }

      if (isMountedRef.current) {
        setError("Could not access camera. Please check permissions or try uploading a QR image.");
        setScanning(false);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      await stopScannerSafely();

      const element = document.getElementById("qr-reader");
      if (!element) return;

      scannerRef.current = new Html5Qrcode("qr-reader");
      const decodedText = await scannerRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
      onClose();
    } catch (err) {
      console.error("File scan failed:", err);
      setError("No QR code detected in this image. Please upload a clear shop QR code.");

      if (open && isMountedRef.current) {
        startCamera();
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const nextIndex = (activeCameraIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    selectedCameraIdRef.current = nextCamera.id;
    setActiveCameraIndex(nextIndex);

    if (isMountedRef.current) {
      await startCamera();
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (!open) {
      setError(null);
      setScanning(false);
      selectedCameraIdRef.current = "";
      stopScannerSafely();
      return;
    }

    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        startCamera();
      }
    }, 250);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      stopScannerSafely();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-md grid place-items-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden"
          >
            <GlassCard strong className="p-6 relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-ink-faint hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-accent-dim text-accent grid place-items-center mb-3">
                  <Camera size={22} />
                </div>
                <h2 className="font-display text-xl text-ink">Scan Shop QR Code</h2>
                <p className="text-xs text-ink-faint mt-1">Point your camera at the QR code or upload a QR image</p>
              </div>

              <div className="relative aspect-square w-full max-w-[280px] mx-auto overflow-hidden rounded-[20px] bg-ink/5 border border-ink/10">
                <div id="qr-reader" className="w-full h-full object-cover" />
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none border-[3px] border-accent/70 rounded-[20px] animate-pulse" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 max-w-[280px] mx-auto flex flex-col gap-3">
                {cameras.length > 1 && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-accent/20 bg-accent-dim text-xs font-semibold text-accent hover:bg-accent-dim/80 transition-all active:scale-[0.98]"
                  >
                    <RefreshCw size={14} />
                    <span>Switch Camera ({activeCameraIndex + 1}/{cameras.length})</span>
                  </button>
                )}

                <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-ink/10 hover:border-ink/20 bg-ink/5 hover:bg-ink/10 text-xs font-semibold text-ink-soft cursor-pointer transition-all active:scale-[0.98]">
                  <Upload size={14} />
                  <span>Upload QR Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-ink-soft mt-5 justify-center bg-stamp/10 p-3 rounded-xl border border-stamp/20">
                  <AlertCircle size={16} className="text-stamp shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Button variant="secondary" size="md" onClick={onClose} className="w-full">
                  Cancel
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
