"use client";

import { useRef, useState } from "react";
import type { ButtonConfig } from "@/lib/bottons";
import { QRCodeGenerator } from "./QRCodeGenerator";

const glossStyles: Record<ButtonConfig["gloss"], string> = {
  none: "",
  light: "linear-gradient(135deg, rgba(255,255,255,.22), transparent 38%)",
  medium: "linear-gradient(135deg, rgba(255,255,255,.34), transparent 42%)",
  strong: "linear-gradient(135deg, rgba(255,255,255,.48), transparent 45%)",
  premium: "radial-gradient(circle at 26% 18%, rgba(255,255,255,.72), transparent 24%), linear-gradient(135deg, rgba(255,255,255,.42), transparent 46%)",
  glass: "linear-gradient(145deg, rgba(255,255,255,.55), rgba(255,255,255,.06) 42%, rgba(255,255,255,.22))",
  metallic: "linear-gradient(115deg, rgba(255,255,255,.5), rgba(0,0,0,.08) 28%, rgba(255,255,255,.28) 54%, rgba(0,0,0,.14))",
};

export function ButtonPreview({
  config,
  compact = false,
  onQrMove,
}: {
  config: ButtonConfig;
  compact?: boolean;
  onQrMove?: (position: { x: number; y: number }) => void;
}) {
  const size = compact ? 220 : 320;
  const radius = config.shape === "circle" ? "9999px" : config.shape === "rounded" ? "28px" : "10px";
  const isRibbon = config.layout === "ribbon";
  const isBadge = config.layout === "badge";
  const backgroundStyle =
    config.backgroundType === "gradient"
      ? `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`
      : config.backgroundType === "image" && config.backgroundImageDataUrl
        ? `radial-gradient(circle at 24% 20%, ${config.accentColor}44, transparent 32%), url(${config.backgroundImageDataUrl}) center/cover no-repeat`
        : `radial-gradient(circle at 24% 20%, ${config.accentColor}55, transparent 32%), ${config.backgroundColor}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function moveQr(clientX: number, clientY: number) {
    if (!containerRef.current || !onQrMove) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    onQrMove({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  return (
    <div className="flex justify-center">
      <div
        ref={containerRef}
        id="button-preview-art"
        className="relative grid place-items-center overflow-hidden border border-black/10 shadow-xl select-none"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: backgroundStyle,
          color: config.textColor,
          fontFamily: config.fontFamily,
        }}
        onMouseMove={(event) => dragging && moveQr(event.clientX, event.clientY)}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchMove={(event) => {
          if (!dragging) return;
          const touch = event.touches[0];
          if (touch) moveQr(touch.clientX, touch.clientY);
        }}
        onTouchEnd={() => setDragging(false)}
      >
        {config.mainImageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.mainImageDataUrl}
            alt="Imagem principal do botton"
            className="absolute left-1/2 top-1/2 max-w-none opacity-95"
            style={{
              width: `${config.imageScale}%`,
              height: `${config.imageScale}%`,
              objectFit: config.imageFit,
              transform: `translate(calc(-50% + ${config.imageX}px), calc(-50% + ${config.imageY}px)) rotate(${config.imageRotation}deg)`,
            }}
            draggable={false}
          />
        ) : null}

        <div className="absolute inset-4 border border-white/35" style={{ borderRadius: radius }} />
        {glossStyles[config.gloss] ? <div className="pointer-events-none absolute inset-0" style={{ background: glossStyles[config.gloss] }} /> : null}

        {isRibbon ? (
          <div className="absolute left-[-44px] top-8 rotate-[-25deg] px-14 py-2 text-xs font-black uppercase tracking-wide" style={{ backgroundColor: config.accentColor, color: config.backgroundColor }}>
            {config.category}
          </div>
        ) : null}
        {isBadge ? (
          <div className="absolute right-6 top-6 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide" style={{ backgroundColor: config.accentColor, color: config.backgroundColor }}>
            Pro
          </div>
        ) : null}

        <div className="relative z-10 grid max-w-[78%] gap-2 text-center drop-shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-80">{config.subtitle}</p>
          <h2 className="break-words text-4xl font-black leading-none sm:text-5xl">{config.title}</h2>
          <p className="text-sm font-bold leading-5 opacity-90">{config.slogan}</p>
        </div>

        {config.showQrCode ? (
          <button
            type="button"
            aria-label="Arrastar QR Code"
            className="absolute z-20 cursor-grab rounded-lg bg-white p-1.5 shadow-lg active:cursor-grabbing"
            style={{
              left: `${config.qrX}%`,
              top: `${config.qrY}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              setDragging(true);
              moveQr(event.clientX, event.clientY);
            }}
            onTouchStart={(event) => {
              setDragging(true);
              const touch = event.touches[0];
              if (touch) moveQr(touch.clientX, touch.clientY);
            }}
          >
            <QRCodeGenerator value={config.qrCodeText} size={compact ? Math.max(40, config.qrSize * 0.75) : config.qrSize} />
          </button>
        ) : null}
      </div>
    </div>
  );
}