import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Phone, Loader2, ChevronDown, Download, Printer, Eye, X, ExternalLink } from "lucide-react";
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

export default function OrderCard({ order, onUpdateStatus, isNew }) {
  const [updating, setUpdating] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const nextStatus = NEXT_STATUS[order.status];

  async function advance() {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await onUpdateStatus(order._id, nextStatus);
    } finally {
      setUpdating(false);
    }
  }

  const handlePrint = (file) => {
    const fileUrl = file.url;
    const fileType = getFileType(file);

    if (fileType === "image") {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head><title>Print ${file.originalName}</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh;">
              <img src="${fileUrl}" style="max-width:100%; max-height:100vh; object-contain;" onload="window.print(); window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      return;
    }

    const printWindow = window.open(fileUrl, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        try {
          printWindow.print();
        } catch (e) {}
      });
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (e) {}
      }, 1200);
    }
  };

  const handleFileAction = async (actionType, file) => {
    if (order.status === "pending" && (actionType === "preview" || actionType === "download")) {
      try {
        await onUpdateStatus(order._id, "preview");
      } catch (err) {
        console.error("Failed to update status to preview:", err);
      }
    }

    if (actionType === "preview") {
      setPreviewFile(file);
    } else if (actionType === "print") {
      handlePrint(file);
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
            {order.files.map((file, idx) => (
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
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-soft hover:bg-white/80 transition-colors"
                  >
                    <Eye size={12} />
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
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-soft transition-colors"
                  >
                    <Printer size={12} />
                    Print
                  </button>
                </div>
              </li>
            ))}
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
            onClick={() => setPreviewFile(null)}
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
                    onClick={() => setPreviewFile(null)}
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
                      src={previewFile.url}
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
