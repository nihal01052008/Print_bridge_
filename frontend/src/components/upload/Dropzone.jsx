import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X } from "lucide-react";
import clsx from "clsx";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Dropzone({ files, onChange }) {
  const onDrop = useCallback(
    (accepted) => {
      onChange([...files, ...accepted].slice(0, 10));
    },
    [files, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 25 * 1024 * 1024,
    maxFiles: 10,
  });

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={clsx(
          "glass border-2 border-dashed rounded-[24px] px-6 py-14 text-center cursor-pointer transition-colors duration-200",
          isDragActive ? "border-accent bg-accent-dim/40" : "border-ink/15 hover:border-accent/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-dim text-accent grid place-items-center">
          <UploadCloud size={24} />
        </div>
        <p className="mt-4 text-ink font-medium">
          {isDragActive ? "Drop your files here" : "Drag files here, or click to browse"}
        </p>
        <p className="mt-1 text-sm text-ink-faint">PDF, Word, or images — up to 25MB each, 10 files max</p>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="glass flex items-center justify-between px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid place-items-center w-9 h-9 rounded-lg bg-accent-dim text-accent shrink-0">
                  <File size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{file.name}</p>
                  <p className="text-xs text-ink-faint">{formatSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="text-ink-faint hover:text-ink transition-colors shrink-0 ml-3"
                aria-label={`Remove ${file.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
