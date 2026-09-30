// Heartfood mark: a pointed lens ("vesica") outline evoking Hartford's
// Phoenix Mutual building's well-known silhouette (a stylized homage, not
// an architectural trace) framing a plain, literal heart symbol. Colors
// pull from the brand palette (see :root in globals.css) — vivid green
// (--g5) for the building outline, a light coral (--r2) for the heart so
// it stays readable against the dark .brand-icon tile background.
export default function BrandIcon({size = 24}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12,1.5 C14.5,4 20,6 20,12 C20,18 14.5,20 12,22.5 C9.5,20 4,18 4,12 C4,6 9.5,4 12,1.5 Z"
        stroke="var(--g5, #16a34a)"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <path
        transform="translate(5.04,4.94) scale(0.58)"
        d="M12,21.35 L10.55,20.03 C5.4,15.36 2,12.28 2,8.5 C2,5.42 4.42,3 7.5,3 C9.24,3 10.91,3.81 12,5.09 C13.09,3.81 14.76,3 16.5,3 C19.58,3 22,5.42 22,8.5 C22,12.28 18.6,15.36 13.45,20.03 L12,21.35 Z"
        fill="var(--r2, #ff9499)"
      />
    </svg>
  );
}
