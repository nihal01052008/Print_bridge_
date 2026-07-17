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
        let slug = pathParts[1];
        // Clean trailing slash
        if (slug.endsWith("/")) {
          slug = slug.slice(0, -1);
        }
        // Extract only the first segment if there are multiple sub-paths
        if (slug.includes("/")) {
          slug = slug.split("/")[0];
        }
        // Remove any query params or hash
        if (slug.includes("?")) {
          slug = slug.split("?")[0];
        }
        if (slug.includes("#")) {
          slug = slug.split("#")[0];
        }
        navigate(`/upload/${slug}`);
      } else {
        alert("Invalid QR Code. Please scan a PrintBridge shop counter QR code.");
      }
    } catch (e) {
      let cleanedText = decodedText ? decodedText.trim() : "";
      if (cleanedText.endsWith("/")) {
        cleanedText = cleanedText.slice(0, -1);
      }
      if (cleanedText && !cleanedText.includes("/")) {
        navigate(`/upload/${cleanedText}`);
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
