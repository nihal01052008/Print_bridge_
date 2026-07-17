import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import GlassCard from "../ui/GlassCard.jsx";
import Button from "../ui/Button.jsx";

export default function QRPanel({ shop }) {
  const [copied, setCopied] = useState(false);
  const qrWrapRef = useRef(null);

  const uploadUrl = `${window.location.origin}/upload/${shop.slug}`;

  function copyLink() {
    navigator.clipboard.writeText(uploadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadQR() {
    const svg = qrWrapRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 800;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 40, 40, size - 80, size - 80);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `${shop.slug}-printbridge-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }

  return (
    <GlassCard strong className="p-6 sm:p-8 text-center">
      <p className="text-xs font-medium text-ink-faint uppercase tracking-wide">Your shop&apos;s QR code</p>
      <p className="mt-1 text-sm text-ink-soft">Display this at the counter — customers scan to upload directly.</p>

      <div ref={qrWrapRef} className="mt-6 mx-auto w-fit bg-white p-4 rounded-2xl">
        <QRCodeSVG value={uploadUrl} size={180} />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="secondary" size="md" onClick={copyLink}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="primary" size="md" onClick={downloadQR}>
          <Download size={16} />
          Download QR
        </Button>
      </div>
    </GlassCard>
  );
}
