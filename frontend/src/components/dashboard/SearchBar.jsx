import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search by name, phone, or code" }) {
  return (
    <div className="relative flex-1">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full glass rounded-2xl pl-11 pr-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </div>
  );
}
