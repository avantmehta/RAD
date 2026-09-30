import type { Metadata } from "next";
import "./globals.css";
import "./enhancements.css";
import "./directory-print.css";

export const metadata: Metadata = {
  title: "Heartfood CT | Greater Hartford",
  description: "Find food resources that fit your schedule and transportation.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

// Fixed 1080x2340 design canvas, scaled to fit any real viewport (phone or
// desktop) so every device renders the identical mobile layout.
const FIT_SCRIPT = `(function(){
  function fit(){
    var el = document.getElementById('app-canvas');
    if(!el) return;
    var s = Math.min(window.innerWidth / 1080, window.innerHeight / 2340);
    el.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="canvas-stage">
          <div className="app-canvas" id="app-canvas">{children}</div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: FIT_SCRIPT }} />
      </body>
    </html>
  );
}

