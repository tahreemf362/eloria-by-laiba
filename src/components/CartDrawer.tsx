import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const freeDeliveryThreshold = 10000;
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeDeliveryThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#fffdfb] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3f1731]/10 p-6">
          <h2 className="font-serif text-2xl text-[#2a1722]">Shopping Bag</h2>
          <button
            onClick={onClose}
            className="p-1 text-[#2a1722] hover:text-[#8b3e67] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {items.length > 0 && (
          <div className="bg-[#f7eef1] px-6 py-3 border-b border-[#3f1731]/10">
            <div className="flex justify-between text-xs text-[#705b66] mb-1.5 font-medium">
              <span>
                {subtotal >= freeDeliveryThreshold
                  ? '🎉 Free delivery unlocked!'
                  : `Add Rs. ${(freeDeliveryThreshold - subtotal).toLocaleString('en-PK')} for free delivery`}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8b3e67] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="grid min-h-64 place-items-center text-center text-[#78636e]">
              <div>
                <p className="font-serif text-2xl text-[#2a1722]">Your bag is empty.</p>
                <p className="mt-2 text-sm">Add a piece you love and it will appear here.</p>
              </div>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.product.id}-${item.size}-${index}`}
                className="grid grid-cols-[82px_1fr] gap-4 border-b border-[#3f1731]/10 pb-5"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="aspect-[3/4] h-full w-full object-cover rounded-xs border border-[#3f1731]/10"
                />
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-serif text-lg text-[#2a1722]">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-[#96828d] hover:text-[#b42318] p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs uppercase tracking-wider text-[#8b3e67] mt-0.5">
                      Size: {item.size}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#2a1722]">
                      Rs. {item.product.price.toLocaleString('en-PK')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 border border-[#3f1731]/15 px-2 py-1 bg-white">
                      <button
                        onClick={() => onUpdateQuantity(index, -1)}
                        className="text-[#705b66] hover:text-[#3f1731]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-4 text-center text-sm font-medium text-[#2a1722]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(index, 1)}
                        className="text-[#705b66] hover:text-[#3f1731]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <strong className="text-sm font-semibold text-[#2a1722]">
                      Rs. {(item.product.price * item.quantity).toLocaleString('en-PK')}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#3f1731]/10 p-6 bg-white">
            <div className="mb-4 flex justify-between text-base">
              <span className="text-[#705b66]">Subtotal</span>
              <strong className="text-xl font-serif text-[#2a1722]">
                Rs. {subtotal.toLocaleString('en-PK')}
              </strong>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="h-12 w-full rounded-none bg-[#3f1731] font-medium text-white transition hover:bg-[#2d1025]"
            >
              Checkout
            </button>

            <p className="mt-3 text-center text-xs text-[#7c6973]">
              Free delivery on orders over Rs. 10,000
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
