import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FrocksPage } from './pages/FrocksPage';
import { DesignYourOwnPage } from './pages/DesignYourOwnPage';
import { FitRoomPage } from './pages/FitRoomPage';
import { CustomerCarePage } from './pages/CustomerCarePage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SearchModal } from './components/SearchModal';
import { AdminModal } from './components/AdminModal';
import { AdminPage } from './pages/AdminPage';
import { Product, CartItem } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname || '/'
  );
  const [currentSearch, setCurrentSearch] = useState<string>(
    window.location.search || ''
  );

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('eloria-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('eloria-cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (pathWithSearch: string) => {
    const [path, search] = pathWithSearch.split('?');
    window.history.pushState({}, '', pathWithSearch);
    setCurrentPath(path || '/');
    setCurrentSearch(search ? `?${search}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, size: string = 'M') => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existingIdx > -1) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((it, i) => (i === index ? { ...it, quantity: newQty } : it));
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Parse category from URL query if on frocks page
  const categoryParam = new URLSearchParams(currentSearch).get('category') || undefined;

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#2a1722] flex flex-col font-sans">
      <Navbar
        currentPath={currentPath}
        navigate={navigate}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        openSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage
            navigate={navigate}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onQuickAdd={(p, s) => handleAddToCart(p, s || 'M')}
          />
        )}

        {currentPath.startsWith('/collections/frocks') && (
          <FrocksPage
            initialCategory={categoryParam}
            navigate={navigate}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onQuickAdd={(p, s) => handleAddToCart(p, s || 'M')}
          />
        )}

        {currentPath === '/design-your-own' && <DesignYourOwnPage />}

        {currentPath === '/fit-room' && <FitRoomPage navigate={navigate} />}

        {currentPath === '/customer-care' && <CustomerCarePage />}

        {(currentPath === '/admin' || currentPath === '/database') && (
          <AdminPage navigate={navigate} />
        )}
      </main>

      <Footer
        navigate={navigate}
        openAdmin={() => setIsAdminOpen(true)}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onNavigateFitRoom={() => {
          setSelectedProduct(null);
          navigate('/fit-room');
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderCompleted={() => {
          setCart([]);
        }}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
