// Stylized, generic Hartford skyline silhouette for the landing page
// background — not an architectural trace, just building-shaped fills
// including a nod to Travelers Tower, the Phoenix Building's rounded
// profile, and CityPlace I's notched crown.
function Buildings() {
  return (
    <g>
      <rect x="0" y="120" width="40" height="80" />
      <rect x="45" y="90" width="30" height="110" />
      <rect x="80" y="140" width="50" height="60" />
      <rect x="140" y="40" width="36" height="160" />
      <polygon points="140,40 158,15 176,40" />
      <rect x="185" y="100" width="34" height="100" />
      <path d="M240,200 C240,150 260,108 280,88 C300,108 320,150 320,200 Z" />
      <rect x="330" y="130" width="28" height="70" />
      <rect x="365" y="80" width="32" height="120" />
      <path d="M410,200 L410,30 L430,30 L430,50 L440,50 L440,30 L460,30 L460,200 Z" />
      <rect x="470" y="150" width="26" height="50" />
      <rect x="505" y="110" width="40" height="90" />
      <rect x="555" y="160" width="30" height="40" />
    </g>
  );
}

export default function HartfordSkyline() {
  return (
    <div className="landing-skyline" aria-hidden="true">
      <svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice">
        <Buildings />
        <g transform="translate(600,0)">
          <Buildings />
        </g>
      </svg>
    </div>
  );
}
