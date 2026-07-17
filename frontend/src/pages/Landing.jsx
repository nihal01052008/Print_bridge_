import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import Hero from "../components/landing/Hero.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import Stats from "../components/landing/Stats.jsx";
import Features from "../components/landing/Features.jsx";
import ForShops from "../components/landing/ForShops.jsx";
import CTASection from "../components/landing/CTASection.jsx";
import QRScannerModal from "../components/landing/QRScannerModal.jsx";

export default function Landing() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const navigate = useNavigate();

  function handleScanSuccess(decodedText) {
    try {
      const url = new URL(decodedText);
      const pathParts = url.pathname.split("/upload/");
      if (pathParts.length > 1) {
        const slug = pathParts[1];
        navigate(`/upload/${slug}`);
      } else {
        alert("Invalid QR Code. Please scan a PrintBridge shop counter QR code.");
      }
    } catch (e) {
      if (decodedText && decodedText.trim() && !decodedText.includes("/")) {
        navigate(`/upload/${decodedText.trim()}`);
      } else {
        alert("Invalid QR Code content.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      <Navbar onScanClick={() => setScannerOpen(true)} />
      <Hero onScanClick={() => setScannerOpen(true)} />
      <HowItWorks />
      <Stats />
      <Features />
      <ForShops />
      <CTASection onScanClick={() => setScannerOpen(true)} />
      <Footer />

      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
