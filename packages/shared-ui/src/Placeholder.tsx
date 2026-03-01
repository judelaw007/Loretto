import React from "react";

interface PlaceholderProps {
  name: string;
}

export function Placeholder({ name }: PlaceholderProps) {
  return (
    <div
      style={{
        padding: "2rem",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        textAlign: "center",
        color: "#666",
      }}
    >
      <p>{name} — component placeholder</p>
    </div>
  );
}
