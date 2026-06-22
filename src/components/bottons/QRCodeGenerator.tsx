"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeGenerator({ value, size = 84 }: { value: string; size?: number }) {
  const [src, setSrc] = useState("");
  const safeValue = value || "https://mktbr.site";

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(safeValue, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#061421", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (active) setSrc(dataUrl);
      })
      .catch(() => {
        if (active) setSrc("");
      });

    return () => {
      active = false;
    };
  }, [safeValue, size]);

  if (!src) {
    return <div style={{ width: size, height: size }} className="rounded-md bg-white" />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} width={size} height={size} alt="QR Code" className="block rounded-md bg-white" draggable={false} />;
}