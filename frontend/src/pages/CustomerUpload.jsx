import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, AlertCircle, QrCode } from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import StepIndicator from "../components/upload/StepIndicator.jsx";
import Dropzone from "../components/upload/Dropzone.jsx";
import PrintSettingsForm from "../components/upload/PrintSettingsForm.jsx";
import SuccessTicket from "../components/upload/SuccessTicket.jsx";
import Button from "../components/ui/Button.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";
import QRScannerModal from "../components/landing/QRScannerModal.jsx";

const STEPS = ["Upload & details", "Success"];

const defaultSettings = {
  customerName: "",
  customerPhone: "",
  copies: 1,
  colorMode: "bw",
  paperSize: "A4",
  sides: "single",
  notes: "",
};

export default function CustomerUpload() {
  const { shopSlug } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [shopError, setShopError] = useState(null);
  const [files, setFiles] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [order, setOrder] = useState(null);

  // Resolve shop from the URL slug, if present
  useEffect(() => {
    if (!shopSlug) {
      setShop(null);
      return;
    }

    let cleanSlug = shopSlug.trim();
    if (cleanSlug.endsWith("/")) {
      cleanSlug = cleanSlug.slice(0, -1);
    }
    if (cleanSlug.includes("/")) {
      cleanSlug = cleanSlug.split("/")[0];
    }
    if (cleanSlug.includes("?")) {
      cleanSlug = cleanSlug.split("?")[0];
    }
    if (cleanSlug.includes("#")) {
      cleanSlug = cleanSlug.split("#")[0];
    }

    setShopError(null);
    api
      .get(`/shops/${cleanSlug}`)
      .then((res) => {
        const s = res.data.shop;
        if (!s.isActive || !s.isAcceptingOrders) {
          setShopError("This shop isn't accepting orders right now.");
        } else {
          setShop(s);
        }
      })
      .catch(() => setShopError("We couldn't find that shop. Make sure you scanned the correct QR code."));
  }, [shopSlug]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (files.length === 0 || !shop) return;

    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append("customerName", settings.customerName);
    formData.append("customerPhone", settings.customerPhone);
    formData.append("copies", settings.copies);
    formData.append("colorMode", settings.colorMode);
    formData.append("paperSize", settings.paperSize);
    formData.append("sides", settings.sides);
    formData.append("notes", settings.notes);
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await api.post(`/orders/${shop.slug}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOrder(res.data.order);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Something went wrong sending your order. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetFlow() {
    setOrder(null);
    setFiles([]);
    setSettings(defaultSettings);
  }

  const [scannerOpen, setScannerOpen] = useState(false);
  const currentStep = order ? 1 : 0;
  const canSubmit = files.length > 0 && !submitting;
  const isLoadingShop = shopSlug && !shop && !shopError;

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
      <Navbar />

      <main className="pt-36 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          {shop && !order && <StepIndicator steps={STEPS} current={currentStep} />}

          <AnimatePresence mode="wait">
            {order ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SuccessTicket order={order} shopName={shop.name} onNewOrder={resetFlow} />
              </motion.div>
            ) : isLoadingShop ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-accent" size={32} />
                <p className="text-ink-soft">Connecting to the shop...</p>
              </motion.div>
            ) : !shop ? (
              <motion.div key="no-shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="p-8 text-center space-y-6 max-w-lg mx-auto">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-accent-dim text-accent grid place-items-center">
                    <QrCode size={32} />
                  </div>
                  <div className="space-y-2">
                    <h1 className="font-display text-3xl text-ink">Scan QR Code to Print</h1>
                    <p className="text-ink-faint leading-relaxed">
                      To upload and print your documents, please visit a partner print shop and scan the QR code displayed at the counter.
                    </p>
                  </div>

                  {shopError && (
                    <div className="glass px-4 py-3 rounded-2xl flex items-center gap-2 text-sm text-ink-soft justify-center">
                      <AlertCircle size={16} className="text-stamp shrink-0" />
                      {shopError}
                    </div>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => setScannerOpen(true)} variant="primary" size="md" className="shrink-0 gap-2">
                      <QrCode size={16} /> Scan Shop QR
                    </Button>
                    <Button as={Link} to="/" variant="secondary" size="md">
                      Go to home
                    </Button>
                    <Button as={Link} to="/shop/dashboard" variant="ghost" size="md">
                      Open shopkeeper panel
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.form
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
              >
                <div className="text-center mb-10">
                  <h1 className="font-display text-3xl text-ink">Send your files</h1>
                  <p className="mt-2 text-ink-faint">
                    Sending to <span className="text-ink font-medium">{shop.name}</span>
                  </p>
                </div>

                <GlassCard className="p-6 sm:p-8 space-y-10">
                  <Dropzone files={files} onChange={setFiles} />
                  <PrintSettingsForm values={settings} onChange={setSettings} />
                </GlassCard>

                {submitError && (
                  <div className="glass mt-6 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm text-ink-soft">
                    <AlertCircle size={16} className="text-stamp shrink-0" />
                    {submitError}
                  </div>
                )}

                {!settings.customerName.trim() && (
                  <div className="glass mt-6 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm text-ink-soft">
                    <AlertCircle size={16} className="text-stamp shrink-0" />
                    <span>Fill in your name to get it easily and early!</span>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => navigate("/")}
                    className="order-2 sm:order-1"
                  >
                    <ArrowLeft size={16} /> Back to home
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!canSubmit}
                    className="order-1 sm:order-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Send to print <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
