import React, { useState } from 'react';
import { Menu, X, ShoppingBag, Search, Camera } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  cartCount: number;
  openCart: () => void;
  openSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  navigate,
  cartCount,
  openCart,
  openSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#3f1731] px-4 py-2 text-center text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/90 sm:text-[0.73rem]">
        Custom stitching · Delivery across Pakistan
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-[#3f1731]/10 bg-[#fcfaf7]/95 backdrop-blur-xl transition-all">
        <div className="mx-auto grid h-[74px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:h-[78px] sm:px-6 lg:px-10">
          
          {/* Mobile menu button */}
          <div className="flex items-center gap-3 justify-self-start lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 text-[#2a1722] hover:text-[#8b3e67] transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={openSearch}
              className="p-1 text-[#2a1722] hover:text-[#8b3e67] transition-colors"
              aria-label="Search"
            >
              <Search size={21} />
            </button>
          </div>

          {/* Desktop Left Nav */}
          <nav className="hidden items-center gap-6 text-[0.82rem] font-medium tracking-wide lg:flex">
            <button
              onClick={() => handleNav('/collections/frocks')}
              className={`hover:text-[#8b3e67] transition-colors ${
                currentPath.startsWith('/collections/frocks') ? 'text-[#8b3e67] font-semibold' : 'text-[#2a1722]'
              }`}
            >
              Frock Atelier
            </button>
            <button
              onClick={() => handleNav('/design-your-own')}
              className={`hover:text-[#8b3e67] transition-colors ${
                currentPath === '/design-your-own' ? 'text-[#8b3e67] font-semibold' : 'text-[#2a1722]'
              }`}
            >
              Design Your Own
            </button>
            <button
              onClick={() => handleNav('/fit-room')}
              className={`hover:text-[#8b3e67] transition-colors ${
                currentPath === '/fit-room' ? 'text-[#8b3e67] font-semibold' : 'text-[#2a1722]'
              }`}
            >
              Find Your Fit
            </button>
          </nav>

          {/* Center Logo */}
          <button
            onClick={() => handleNav('/')}
            className="justify-self-center focus:outline-none"
            aria-label="ELORIA by Laiba home"
          >
            <span className="relative block h-12 w-36 overflow-hidden sm:h-14 sm:w-44">
              <img
                src="/eloria-logo.jpg"
                alt="ELORIA by Laiba"
                className="absolute left-1/2 top-1/2 h-auto w-[115%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
              />
            </span>
          </button>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <button
              onClick={openSearch}
              className="hidden lg:inline-flex p-1 text-[#2a1722] hover:text-[#8b3e67] transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <a
              className="hidden lg:inline-flex text-[#2a1722] hover:text-[#8b3e67] transition-colors"
              href="https://www.instagram.com/eloriabylaiba/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Camera size={19} />
            </a>

            {/* Shopping Bag Button */}
            <button
              onClick={openCart}
              className="relative p-1 text-[#2a1722] hover:text-[#8b3e67] transition-colors"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-2.5 -top-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#8b3e67] px-1 text-[0.65rem] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex h-full w-[82%] max-w-sm flex-col bg-[#fffdfb] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-[#3f1731]/10">
              <span className="relative block h-10 w-28 overflow-hidden">
                <img
                  src="/eloria-logo.jpg"
                  alt="ELORIA by Laiba"
                  className="absolute left-1/2 top-1/2 h-auto w-[115%] max-w-none -translate-x-1/2 -translate-y-1/2"
                />
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#2a1722] hover:text-[#8b3e67]"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-6 text-lg font-serif">
              <button
                onClick={() => handleNav('/')}
                className="text-left hover:text-[#8b3e67]"
              >
                Home
              </button>
              <button
                onClick={() => handleNav('/collections/frocks')}
                className="text-left hover:text-[#8b3e67]"
              >
                Frock Atelier
              </button>
              <button
                onClick={() => handleNav('/design-your-own')}
                className="text-left hover:text-[#8b3e67]"
              >
                Design Your Own
              </button>
              <button
                onClick={() => handleNav('/fit-room')}
                className="text-left hover:text-[#8b3e67]"
              >
                Find Your Fit
              </button>
              <button
                onClick={() => handleNav('/customer-care')}
                className="text-left text-base font-sans text-[#705b66] hover:text-[#8b3e67]"
              >
                Customer Care &amp; FAQ
              </button>
            </div>

            <div className="mt-auto border-t border-[#3f1731]/10 pt-6">
              <a
                href="https://www.instagram.com/eloriabylaiba/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[#705b66] hover:text-[#8b3e67]"
              >
                <Camera size={16} /> @eloriabylaiba
              </a>
              <p className="mt-3 text-xs text-[#96828d]">
                Custom stitching &middot; Delivery across Pakistan
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
