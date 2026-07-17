import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import FadeIn from "../ui/FadeIn.jsx";
import Button from "../ui/Button.jsx";

export default function CTASection({ onScanClick }) {
  return (
    <section className="relative py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn>
          <h2 className="font-display text-4xl tracking-tight text-ink">Ready when you are</h2>
          <p className="mt-4 text-lg text-ink-faint">
            Scan a shop counter QR code to upload your files in under a minute.
          </p>
          <div className="mt-8 flex justify-center">
            <Button onClick={onScanClick} variant="primary" size="hero">
              Scan Shop QR
              <ArrowRight size={18} />
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
