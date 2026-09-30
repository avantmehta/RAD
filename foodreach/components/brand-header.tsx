import Link from 'next/link';
import BrandIcon from './brand-icon';

export default function BrandHeader({ size = 23 }: { size?: number }) {
  return (
    <Link href="/" className="brand">
      <span className="brand-icon"><BrandIcon size={size} /></span>
      <span className="hf-heart">Heart</span><span className="hf-food">food</span>
    </Link>
  );
}
