import Segmented from "../ui/Segmented.jsx";

const options = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "printing", label: "Printing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
];

export default function FilterTabs({ value, onChange }) {
  return (
    <div className="overflow-x-auto">
      <Segmented name="Status filter" options={options} value={value} onChange={onChange} />
    </div>
  );
}
