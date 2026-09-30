import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
  onNavigateFitRoom: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onNavigateFitRoom,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('M');

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-lg border-none bg-[#fffdfb] p-0 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-[#2a1722] hover:bg-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-[#f7eef1]">
            <img
              src={product.image}
              alt={product.name}
              className="h-full min-h-[380px] md:min-h-[460px] w-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-white/95 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#3f1731] shadow-xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-[.12em] text-[#8b3e67]">
                {product.category}
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-[#2a1722]">
                {product.name}
              </h2>
              <p className="mt-4 text-base leading-7 text-[#6d5863]">
                {product.description}
              </p>
            </div>

            <p className="mt-6 text-xl font-medium text-[#2a1722]">
              Rs. {product.price.toLocaleString('en-PK')}
            </p>

            {/* Sizes */}
            <div className="mt-8">
              <p className="mb-3 font-medium text-sm text-[#2a1722]">Choose a size</p>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`grid h-11 w-12 place-items-center border text-sm font-medium transition ${
                      selectedSize === size
                        ? 'border-[#3f1731] bg-[#3f1731] text-white'
                        : 'border-[#3f1731]/20 bg-white text-[#2a1722] hover:border-[#3f1731]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleAddToCart}
              className="mt-8 h-12 w-full rounded-none bg-[#3f1731] font-medium text-white transition hover:bg-[#2d1025]"
            >
              Add to bag
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateFitRoom();
              }}
              className="mt-4 text-center text-sm text-[#705b66] underline underline-offset-4 hover:text-[#3f1731]"
            >
              Check the measurement guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
