import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-paper">
      <Loader2 className="animate-spin text-ink-faint" size={24} />
    </div>
  );
}
