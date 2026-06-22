import type { ButtonConfig } from "@/lib/bottons";
import { QRCodeGenerator } from "./QRCodeGenerator";

export function ButtonPreview({ config, compact = false }: { config: ButtonConfig; compact?: boolean }) {
  const size = compact ? 220 : 320;
  const radius = config.shape === "circle" ? "9999px" : config.shape === "rounded" ? "28px" : "10px";
  const isRibbon = config.layout === "ribbon";
  const isBadge = config.layout === "badge";

  return (
    <div className="flex justify-center">
      <div
        id="button-preview-art"
        className="relative grid place-items-center overflow-hidden border border-black/10 shadow-xl"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: `radial-gradient(circle at 24% 20%, ${config.accentColor}55, transparent 32%), ${config.backgroundColor}`,
          color: config.textColor,
          fontFamily: config.fontFamily,
        }}
      >
        <div className="absolute inset-4 border border-white/35" style={{ borderRadius: radius }} />
        {isRibbon ? (
          <div
            className="absolute left-[-44px] top-8 rotate-[-25deg] px-14 py-2 text-xs font-black uppercase tracking-wide"
            style={{ backgroundColor: config.accentColor, color: config.backgroundColor }}
          >
            {config.category}
          </div>
        ) : null}
        {isBadge ? (
          <div
            className="absolute right-6 top-6 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide"
            style={{ backgroundColor: config.accentColor, color: config.backgroundColor }}
          >
            Pro
          </div>
        ) : null}

        <div className="relative z-10 grid max-w-[78%] gap-2 text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-80">{config.subtitle}</p>
          <h2 className="break-words text-4xl font-black leading-none sm:text-5xl">{config.title}</h2>
          <p className="text-sm font-bold leading-5 opacity-90">{config.slogan}</p>
        </div>

        {config.showQrCode ? (
          <div className="absolute bottom-6 right-6 rounded-lg bg-white p-1.5 shadow-lg">
            <QRCodeGenerator value={config.qrCodeText} size={compact ? 48 : 62} />
          </div>
        ) : null}
      </div>
    </div>
  );
}