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

  const startCamera = async (isMountedRef) => {
    setError(null);
    hasScannedRef.current = false;
    try {
      // 1. Wait for any pending start/stop operations to finish
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

      // 2. Stop camera if it's already running
      if (scannerRef.current && scannerRef.current.isScanning) {
        const stopPromise = scannerRef.current.stop();
        stopPromiseRef.current = stopPromise;
        await stopPromise;
        stopPromiseRef.current = null;
      }

      // 3. Check if element is in the DOM
      const element = document.getElementById("qr-reader");
      if (!element) {
        console.warn("DOM element #qr-reader not found yet");
        return;
      }

      // 4. Instantiate scanner if it doesn't exist
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      const html5QrCode = scannerRef.current;

      const config = {
        fps: 20, // Increased FPS for faster scanning response times
        qrbox: (width, height) => {
          const size = Math.min(width, height) * 0.75;
          return { width: size, height: size };
        },
        aspectRatio: 1.0,
        videoConstraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // Prefer back camera (environment) primarily, unless the user manually switched
      let cameraIdOrConfig = { facingMode: "environment" };
      if (selectedCameraIdRef.current) {
        cameraIdOrConfig = selectedCameraIdRef.current;
      }

      const startPromise = html5QrCode.start(
        cameraIdOrConfig,
        config,
        async (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          try {
            if (scannerRef.current && scannerRef.current.isScanning) {
              const stopPromise = scannerRef.current.stop();
              stopPromiseRef.current = stopPromise;
              await stopPromise;
              stopPromiseRef.current = null;
            }
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
        undefined // passing undefined to avoid CPU overhead and browser crashes
      );

      startPromiseRef.current = startPromise;
      await startPromise;
      startPromiseRef.current = null;

      if (isMountedRef.current) {
        setScanning(true);
      }

      // Fetch cameras list to allow toggling/switching
      try {
        const camerasList = await Html5Qrcode.getCameras();
        if (isMountedRef.current) {
          setCameras(camerasList);
          
          // Identify which camera is active and update selection
          try {
            const trackSettings = html5QrCode.getRunningTrackSettings();
            const activeCam = camerasList.find(cam => cam.id === trackSettings.deviceId);
            if (activeCam) {
              const idx = camerasList.indexOf(activeCam);
              setActiveCameraIndex(idx);
              selectedCameraIdRef.current = activeCam.id;
            }
          } catch (e) {
            // track settings might not be fully populated immediately, fallback
          }
        }
      } catch (e) {
        console.warn("Failed to get cameras list", e);
      }
    } catch (err) {
      console.error("Camera failed to start:", err);
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
      // 1. Wait for any pending start/stop operations to finish
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

      // 2. Stop camera if it's running
      if (scannerRef.current && scannerRef.current.isScanning) {
        const stopPromise = scannerRef.current.stop();
        stopPromiseRef.current = stopPromise;
        await stopPromise;
        stopPromiseRef.current = null;
        setScanning(false);
      }

      // 3. Ensure we have the DOM element
      const element = document.getElementById("qr-reader");
      if (!element) {
        console.warn("DOM element #qr-reader not found yet");
        return;
      }

      // 4. Instantiate scanner if it doesn't exist
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      const decodedText = await scannerRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
      onClose();
    } catch (err) {
      console.error("File scan failed:", err);
      setError("No QR code detected in this image. Please upload a clear shop QR code.");
      
      // Restart camera scanner after failed file input
      if (open && isMountedRef.current) {
        startCamera(isMountedRef);
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const nextIndex = (activeCameraIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    selectedCameraIdRef.current = nextCamera.id;
    setActiveCameraIndex(nextIndex);
    
    // Restart camera with selected ID
    if (isMountedRef.current) {
      startCamera(isMountedRef);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (!open) {
      setError(null);
      setScanning(false);
      return;
    }

    // A 250ms timeout ensures the modal is fully mounted and animation has progressed before camera starts
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        startCamera(isMountedRef);
      }
    }, 250);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      
      const stopScanner = async () => {
        // Wait for any pending start/stop
        if (startPromiseRef.current) {
          try {
            await startPromiseRef.current;
          } catch (e) {}
        }
        if (stopPromiseRef.current) {
          try {
            await stopPromiseRef.current;
          } catch (e) {}
        }
        if (scannerRef.current) {
          const scanner = scannerRef.current;
          if (scanner.isScanning) {
            try {
              await scanner.stop();
            } catch (e) {
              console.error("Cleanup stop failed:", e);
            }
          }
          try {
            scanner.clear();
          } catch (e) {}
          scannerRef.current = null;
        }
      };
      stopScanner();
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
