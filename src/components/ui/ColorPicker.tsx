"use client";

const COLORS = [
  { value: "#00a99d", label: "Teal" },
  { value: "#b5d334", label: "Green" },
  { value: "#f7941d", label: "Orange" },
  { value: "#29abe2", label: "Cyan" },
  { value: "#8e24aa", label: "Purple" },
  { value: "#d50000", label: "Red" },
  { value: "#1a73e8", label: "Blue" },
  { value: "#616161", label: "Gray" },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
            value === color.value ? "border-gray-900 ring-2 ring-offset-2" : "border-transparent"
          }`}
          style={{ backgroundColor: color.value }}
          title={color.label}
          aria-label={color.label}
        />
      ))}
    </div>
  );
}
