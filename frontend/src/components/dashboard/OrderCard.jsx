import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Phone, Loader2, ChevronDown, Download, Printer, Eye, X, ExternalLink, AlertCircle } from "lucide-react";
import GlassCard from "../ui/GlassCard.jsx";
import StatusBadge from "./StatusBadge.jsx";

const NEXT_STATUS = {
  pending: "printing",
  preview: "printing",
  printing: "ready",
  ready: "completed",
};
const NEXT_LABEL = {
  pending: "Start printing",
  preview: "Start printing",
  printing: "Mark ready",
  ready: "Mark completed",
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getFileType(file) {
  const name = (file.originalName || "").toLowerCase();
  const format = (file.format || "").toLowerCase();
  const url = (file.url || "").toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(format) || /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(name || url)) {
    return "image";
  }
  if (format === "pdf" || /\.pdf($|\?)/i.test(name || url)) {
    return "pdf";
  }
  if (
    ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv", "rtf"].includes(format) ||
    /\.(doc|docx|ppt|pptx|xls|xlsx|txt|csv|rtf)($|\?)/i.test(name || url)
  ) {
    return "document";
  }
  return "other";
}

function OrderCard({ order, onUpdateStatus, isNew }) {
  const [updating, setUpdating] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [loadingActionFile, setLoadingActionFile] = useState(null);
  const [actionError, setActionError] = useState(null);

  // In-memory cache for PDF Blob URLs and active fetch promises
  const blobCacheRef = useRef(new Map()); // Map<secure_url, blob_url>
  const inFlightRef = useRef(new Map());  // Map<secure_url, Promise<blob_url>>

  const nextStatus = NEXT_STATUS[order.status];

  // Helper to revoke all cached Blob URLs and clear cache
  const clearBlobCache = useCallback(() => {
    blobCacheRef.current.forEach((blobUrl) => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (e) {}
    });
    blobCacheRef.current.clear();
    inFlightRef.current.clear();
  }, []);

  // Revoke Blob URLs when component unmounts
  useEffect(() => {
    return () => {
      clearBlobCache();
    };
  }, [clearBlobCache]);

  // Fetches a PDF as a Blob URL, caching the result and deduplicating in-flight requests
  const getPdfBlobUrl = useCallback(async (url) => {
    if (blobCacheRef.current.has(url)) {
      return blobCacheRef.current.get(url);
    }
    if (inFlightRef.current.has(url)) {
      return inFlightRef.current.get(url);
    }

    const fetchPromise = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const blob = await res.blob();
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(pdfBlob);
        blobCacheRef.current.set(url, blobUrl);
        return blobUrl;
      } finally {
        inFlightRef.current.delete(url);
      }
    })();

    inFlightRef.current.set(url, fetchPromise);
    return fetchPromise;
  }, []);

  const handleClosePreview = useCallback(() => {
    clearBlobCache();
    setPreviewFile(null);
    setPreviewBlobUrl(null);
    setActionError(null);
  }, [clearBlobCache]);

  async function advance() {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await onUpdateStatus(order._id, nextStatus);
    } finally {
      setUpdating(false);
    }
  }

  const handlePrint = async (file) => {
    const fileType = getFileType(file);
    const { copies = 1, colorMode = "bw", paperSize = "A4", sides = "single" } = order.printSettings || {};
    const isBW = colorMode === "bw";
    const paperSizeCss = paperSize || "A4";

    let printableUrl = file.url;

    if (fileType === "pdf") {
      setLoadingActionFile(file.url);
      setActionError(null);
      try {
        printableUrl = await getPdfBlobUrl(file.url);
      } catch (err) {
        console.error("Failed to load PDF for printing:", err);
        setActionError(`Could not print "${file.originalName}": ${err.message}`);
        setLoadingActionFile(null);
        return;
      } finally {
        setLoadingActionFile(null);
      }
    }

    const printWindow = window.open("", "_blank", "width=900,height=850");
    if (!printWindow) {
      setActionError("Pop-up window blocked. Please allow pop-ups to print.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Order ${order.orderCode} - ${file.originalName}</title>
          <style>
            @page {
              size: ${paperSizeCss};
              margin: 8mm;
            }
            html, body {
              margin: 0;
              padding: 12px;
              font-family: system-ui, -apple-system, sans-serif;
              color: #111;
              color-scheme: light !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @media print {
              html, body, img, iframe, embed {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                ${isBW ? "filter: grayscale(100%) !important; -webkit-filter: grayscale(100%) !important;" : ""}
              }
              .no-print {
                display: none !important;
              }
            }
            .ticket-header {
              background: #f8fafc;
              border: 1.5px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px 18px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 13px;
            }
            .ticket-badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: 700;
              background: #000;
              color: #fff;
              font-size: 12px;
            }
            .preview-container {
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            img {
              max-width: 100%;
              max-height: 85vh;
              object-fit: contain;
            }
            iframe, embed {
              width: 100%;
              height: 85vh;
              border: none;
            }
          </style>
        </head>
        <body>
          <div class="ticket-header no-print">
            <div>
              <span class="ticket-badge">PRINT JOB</span>
              <span style="margin-left: 10px; font-weight: 600;">Code: ${order.orderCode}</span>
              <span style="color: #64748b;"> | Customer: ${order.customerName || "Anonymous"}</span>
            </div>
            <div style="font-size: 12px; color: #334155;">
              <strong>Copies:</strong> ${copies} |
              <strong>Color:</strong> ${isBW ? "Black & White" : "Color"} |
              <strong>Paper:</strong> ${paperSize} |
              <strong>Sides:</strong> ${sides === "double" ? "Double-sided" : "Single-sided"}
            </div>
          </div>
          <div class="preview-container">
            ${
              fileType === "image"
                ? `<img src="${printableUrl}" id="printTarget" />`
                : fileType === "pdf"
                ? `<iframe src="${printableUrl}" id="printTarget"></iframe>`
                : `<iframe src="https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true" id="printTarget"></iframe>`
            }
          </div>
          <script>
            let hasPrinted = false;
            function doPrint() {
              if (hasPrinted) return;
              hasPrinted = true;
              setTimeout(function() {
                try {
                  const el = document.getElementById("printTarget");
                  if (el && el.tagName === "IFRAME" && el.contentWindow) {
                    el.contentWindow.focus();
                    el.contentWindow.print();
                    return;
                  }
                } catch (e) {}
                window.focus();
                window.print();
              }, 300);
            }

            const el = document.getElementById("printTarget");
            if (el) {
              el.onload = doPrint;
            }
            window.onload = function() {
              setTimeout(doPrint, 1000);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleFileAction = async (actionType, file) => {
    setActionError(null);

    if (order.status === "pending" && (actionType === "preview" || actionType === "download")) {
      try {
        await onUpdateStatus(order._id, "preview");
      } catch (err) {
        console.error("Failed to update status to preview:", err);
      }
    }

    if (actionType === "preview") {
      const fileType = getFileType(file);
      if (fileType === "pdf") {
        setLoadingActionFile(file.url);
        try {
          const blobUrl = await getPdfBlobUrl(file.url);
          setPreviewBlobUrl(blobUrl);
          setPreviewFile(file);
        } catch (err) {
          console.error("Failed to load PDF preview:", err);
          setActionError(`Unable to preview "${file.originalName}": ${err.message}`);
        } finally {
          setLoadingActionFile(null);
        }
      } else {
        setPreviewFile(file);
        setPreviewBlobUrl(null);
      }
    } else if (actionType === "print") {
      await handlePrint(file);
      try {
        await onUpdateStatus(order._id, "ready");
      } catch (err) {
        console.error("Failed to update status to ready:", err);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -12, scale: 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <GlassCard className="p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="grid place-items-center w-11 h-11 rounded-xl bg-accent-dim text-accent shrink-0">
            <FileText size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-ink">{order.customerName}</p>
              <span className="text-ink-faint text-xs">·</span>
              <p className="font-display text-sm tracking-wide text-ink-soft">{order.orderCode}</p>
            </div>
            <p className="text-sm text-ink-faint mt-0.5">
              {order.files.length} file{order.files.length > 1 ? "s" : ""} · {order.printSettings.copies}{" "}
              {order.printSettings.copies > 1 ? "copies" : "copy"} ·{" "}
              {order.printSettings.colorMode === "bw" ? "B&W" : "Color"} ·{" "}
              {order.printSettings.sides === "double" ? "Double-sided" : "Single-sided"}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-ink-faint">
              <span>{timeAgo(order.createdAt)}</span>
              {order.customerPhone && (
                <span className="flex items-center gap-1">
                  <Phone size={11} /> {order.customerPhone}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <StatusBadge status={order.status} />
            {nextStatus && (
              <button
                onClick={advance}
                disabled={updating}
                className="text-xs font-medium text-accent hover:text-ink transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {updating ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
                {NEXT_LABEL[order.status]}
              </button>
            )}
          </div>
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="flex items-center justify-between text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl mt-1 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle size={14} className="shrink-0" />
              <span className="truncate">{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-400 hover:text-rose-700 ml-2 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Notes Section */}
        {order.notes && (
          <div className="text-xs text-stamp bg-stamp/5 border border-stamp/10 px-3 py-2 rounded-xl mt-1 w-full">
            <span className="font-semibold">Note:</span> {order.notes}
          </div>
        )}

        {/* Files List with Actions */}
        <div className="mt-2 border-t border-ink/5 pt-3">
          <p className="text-xs font-semibold text-ink-soft mb-2">Print Files:</p>
          <ul className="space-y-2">
            {order.files.map((file, idx) => {
              const isLoadingThisFile = loadingActionFile === file.url;
              return (
                <li key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper-dim/40 p-2.5 rounded-xl hover:bg-paper-dim/75 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={15} className="text-ink-soft shrink-0" />
                    <span className="text-xs font-medium text-ink-soft truncate" title={file.originalName}>
                      {file.originalName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleFileAction("preview", file)}
                      disabled={isLoadingThisFile}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-soft hover:bg-white/80 transition-colors disabled:opacity-50"
                    >
                      {isLoadingThisFile ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
                      Preview
                    </button>
                    <a
                      href={file.url}
                      download={file.originalName}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleFileAction("download", file)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-soft hover:bg-white/80 transition-colors"
                    >
                      <Download size={12} />
                      Download
                    </a>
                    <button
                      onClick={() => handleFileAction("print", file)}
                      disabled={isLoadingThisFile}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-soft transition-colors disabled:opacity-50"
                    >
                      {isLoadingThisFile ? <Loader2 size={12} className="animate-spin" /> : <Printer size={12} />}
                      Print
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </GlassCard>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-md grid place-items-center p-6"
            onClick={handleClosePreview}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl overflow-hidden"
            >
              <GlassCard strong className="p-6 relative flex flex-col max-h-[88vh]">
                <div className="flex items-center justify-between pb-4 border-b border-ink/10 pr-8">
                  <h3 className="font-display font-medium text-lg text-ink truncate">
                    {previewFile.originalName}
                  </h3>
                  <button
                    type="button"
                    onClick={handleClosePreview}
                    className="absolute top-6 right-6 text-ink-faint hover:text-ink transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto py-4 grid place-items-center bg-paper-dim/30 rounded-xl mt-4 min-h-[350px]">
                  {getFileType(previewFile) === "image" ? (
                    <img
                      src={previewFile.url}
                      alt={previewFile.originalName}
                      className="max-h-[60vh] object-contain rounded-lg shadow-sm"
                    />
                  ) : getFileType(previewFile) === "pdf" ? (
                    <iframe
                      src={previewBlobUrl || previewFile.url}
                      title={previewFile.originalName}
                      className="w-full h-[60vh] rounded-lg border border-ink/10 bg-white"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
                        title={previewFile.originalName}
                        className="w-full h-[55vh] rounded-lg border border-ink/10 bg-white"
                      />
                      <div className="mt-3 flex items-center justify-center gap-3 text-xs">
                        <span className="text-ink-faint">Document Preview powered by Google Viewer</span>
                        <a
                          href={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline flex items-center gap-1 font-medium"
                        >
                          Open in Google Docs <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-ink/10 mt-4">
                  <a
                    href={previewFile.url}
                    download={previewFile.originalName}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleFileAction("download", previewFile)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-ink-soft hover:bg-paper-dim transition-colors"
                  >
                    <Download size={16} />
                    Download File
                  </a>
                  <button
                    onClick={() => handleFileAction("print", previewFile)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-soft transition-colors"
                  >
                    <Printer size={16} />
                    Print File
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(OrderCard);
