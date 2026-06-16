"use client";

import Script from "next/script";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
    __mktbrVLibrasInitialized?: boolean;
  }
}

function initializeVLibras() {
  try {
    if (window.__mktbrVLibrasInitialized || !window.VLibras?.Widget) {
      return;
    }

    window.__mktbrVLibrasInitialized = true;
    new window.VLibras.Widget("https://vlibras.gov.br/app");
  } catch {
    window.__mktbrVLibrasInitialized = false;
  }
}

export function VLibrasWidget() {
  return (
    <>
      <div className="enabled mktbr-vlibras" {...{ vw: "" }}>
        <div className="active" {...{ "vw-access-button": "" }} />
        <div {...{ "vw-plugin-wrapper": "" }}>
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>
      <Script
        id="vlibras-plugin"
        src="https://vlibras.gov.br/app/vlibras-plugin.js"
        strategy="afterInteractive"
        onReady={initializeVLibras}
        onLoad={initializeVLibras}
        onError={() => {
          window.__mktbrVLibrasInitialized = false;
        }}
      />
    </>
  );
}
