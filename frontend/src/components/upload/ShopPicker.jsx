import { useEffect, useState } from "react";
import { MapPin, Phone, Loader2, Store } from "lucide-react";
import GlassCard from "../ui/GlassCard.jsx";
import api from "../../lib/api.js";

export default function ShopPicker({ onSelect }) {
  const [shops, setShops] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/shops/public")
      .then((res) => setShops(res.data.shops))
      .catch(() => setError("Couldn't load shops right now. Try again in a moment."));
  }, []);

  if (error) {
    return <p className="text-center text-ink-faint">{error}</p>;
  }

  if (!shops) {
    return (
      <div className="flex justify-center py-16 text-ink-faint">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  if (shops.length === 0) {
    return <p className="text-center text-ink-faint">No shops are accepting orders right now.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {shops.map((shop) => (
        <button key={shop.slug} onClick={() => onSelect(shop)} className="text-left">
          <GlassCard hover className="p-6 h-full">
            <div className="flex items-start gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-accent-dim text-accent shrink-0">
                <Store size={18} />
              </div>
              <div>
                <p className="font-medium text-ink">{shop.name}</p>
                {shop.address && (
                  <p className="mt-1 text-xs text-ink-faint flex items-center gap-1">
                    <MapPin size={12} /> {shop.address}
                  </p>
                )}
                {shop.phone && (
                  <p className="mt-0.5 text-xs text-ink-faint flex items-center gap-1">
                    <Phone size={12} /> {shop.phone}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </button>
      ))}
    </div>
  );
}
