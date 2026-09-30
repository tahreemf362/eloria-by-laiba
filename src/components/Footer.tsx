import React from 'react';
import { Camera, ShieldCheck } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
  openAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate, openAdmin }) => {
  const handleNav = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#2d1025] px-6 py-14 text-white/85">
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <span className="relative block h-12 w-36 overflow-hidden sm:h-14 sm:w-44">
            <img
              src="/eloria-logo.jpg"
              alt="ELORIA by Laiba"
              className="absolute left-1/2 top-1/2 h-auto w-[115%] max-w-none -translate-x-1/2 -translate-y-1/2"
            />
          </span>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
            Printed frocks and custom stitching, made in Pakistan.
          </p>
        </div>

        {/* Browse */}
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.18em] text-white/45">Browse</p>
          <div className="grid gap-3 text-sm">
            <button
              onClick={() => handleNav('/collections/frocks')}
              className="text-left text-white/80 hover:text-white transition-colors"
            >
              Frock Atelier
            </button>
            <button
              onClick={() => handleNav('/design-your-own')}
              className="text-left text-white/80 hover:text-white transition-colors"
            >
              Design Your Own
            </button>
            <button
              onClick={() => handleNav('/fit-room')}
              className="text-left text-white/80 hover:text-white transition-colors"
            >
              Find Your Fit
            </button>
          </div>
        </div>

        {/* Need Help */}
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.18em] text-white/45">Need help?</p>
          <div className="grid gap-3 text-sm">
            <button
              onClick={() => handleNav('/customer-care')}
              className="text-left text-white/80 hover:text-white transition-colors"
            >
              Delivery, returns &amp; payments
            </button>
            <a
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              href="https://www.instagram.com/eloriabylaiba/"
              target="_blank"
              rel="noreferrer"
            >
              <Camera size={16} /> @eloriabylaiba
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1440px] flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
        <button
          onClick={() => handleNav('/admin')}
          className="text-left hover:text-white/70 transition flex items-center gap-1.5 focus:outline-none"
          title="Store Owner Access"
        >
          <span>© 2026 ELORIA by Laiba</span>
          <ShieldCheck size={11} className="opacity-30 hover:opacity-100 transition-opacity" />
        </button>
        <span>Made with care in Pakistan</span>
      </div>
    </footer>
  );
};
