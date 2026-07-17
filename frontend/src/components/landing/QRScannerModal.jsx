import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, AlertCircle, Upload, Image } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import GlassCard from "../ui/GlassCard.jsx";
import Button from "../ui/Button.jsx";

export default function QRScannerModal({ open, onClose, onScanSuccess }) {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const isMountedRef = useRef(true);

  const startCamera = async (isMountedRef) => {
    setError(null);
    try {
      // Clean up any existing scanner instance first
      if (scannerRef.current) {
        const existingScanner = scannerRef.current;
        scannerRef.current = null;
        if (existingScanner.isScanning) {
          try {
            await existingScanner.stop();
          } catch (e) {
            console.error("Error stopping existing scanner during startCamera:", e);
          }
        }
      }

      // Check if element is in the DOM
      const element = document.getElementById("qr-reader");
      if (!element) {
        console.warn("DOM element #qr-reader not found yet");
        return;
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

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

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          try {
            if (scannerRef.current && scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
          } catch (err) {
            console.error("Stop failed on success:", err);
          } finally {
            scannerRef.current = null;
            if (isMountedRef.current) {
              setScanning(false);
            }
            onScanSuccess(decodedText);
            onClose();
          }
        },
        (errorMessage) => {
          // quiet error logging
        }
      );

      if (isMountedRef.current) {
        setScanning(true);
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
      if (scannerRef.current) {
        const existingScanner = scannerRef.current;
        scannerRef.current = null;
        if (existingScanner.isScanning) {
          await existingScanner.stop();
        }
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const decodedText = await html5QrCode.scanFile(file, true);
      onScanSuccess(decodedText);
      onClose();
    } catch (err) {
      console.error("File scan failed:", err);
      setError("No QR code detected in this image. Please upload a clear shop QR code.");
      
      // Restart camera scanner after failed file input
      if (open) {
        startCamera(isMountedRef);
      }
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
      
      // Stop scanning on cleanup
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        if (scanner.isScanning) {
          scanner.stop().catch((e) => console.error("Cleanup stop failed:", e));
        }
      }
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

              {/* Static QR Image Upload Section */}
              <div className="mt-5 max-w-[280px] mx-auto">
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
