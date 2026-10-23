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
    if (!decodedText) return;
    let text = String(decodedText).trim();
    try {
      if (text.startsWith("http://") || text.startsWith("https://")) {
        const parsedUrl = new URL(text);
        text = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
      }
    } catch (e) {}

    if (text.includes("/upload/")) {
      text = text.split("/upload/")[1];
    }
    text = text.replace(/\/+$/, "");
    if (text.includes("/")) text = text.split("/")[0];
    if (text.includes("?")) text = text.split("?")[0];
    if (text.includes("#")) text = text.split("#")[0];

    const slug = decodeURIComponent(text).trim().toLowerCase();
    if (slug) {
      navigate(`/upload/${slug}`);
    } else {
      alert("Invalid QR Code content.");
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
