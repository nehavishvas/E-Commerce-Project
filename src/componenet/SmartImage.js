import React, { useMemo, useState } from "react";

const createFallbackSvg = (label) => {
  const safeLabel = String(label || "Product")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#f3f4f6"/>
      <rect x="64" y="64" width="512" height="352" rx="28" fill="#e5e7eb" stroke="#d1d5db" />
      <circle cx="220" cy="190" r="42" fill="#cbd5e1" />
      <path d="M142 336l108-108 84 78 76-60 88 90H142z" fill="#cbd5e1" />
      <text x="320" y="402" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#475569">${safeLabel}</text>
    </svg>
  `)}`;
};

const SmartImage = ({ src, alt, fallbackLabel, ...props }) => {
  const [hasError, setHasError] = useState(false);
  const fallbackSrc = useMemo(
    () => createFallbackSvg(fallbackLabel || alt || "Product"),
    [alt, fallbackLabel]
  );

  const imageSrc = !hasError && src ? src : fallbackSrc;

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      loading={props.loading || "lazy"}
      onError={() => setHasError(true)}
    />
  );
};

export default SmartImage;
