import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS.slice(0, 4);
    return PRODUCTS.filter((p) =>
      `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg border border-[#dfd2d8] bg-[#fffdfb] p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#3f1731]/10">
          <div>
            <h2 className="font-serif text-2xl text-[#2a1722]">Search ELORIA</h2>
            <p className="text-sm text-[#78636e] mt-0.5">
              Find a frock by name, colour or style.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#2a1722] hover:text-[#8b3e67] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input */}
        <div className="mt-5 flex items-center gap-3 border border-[#3f1731]/20 bg-white px-4">
          <Search size={18} className="text-[#8b3e67]" />
          <input
            type="text"
            placeholder="Try berry, floral or custom"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full outline-none text-[#2a1722] bg-transparent text-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#705b66] hover:text-[#3f1731]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mt-5 divide-y divide-[#3f1731]/10">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className="flex w-full items-center gap-4 py-3 text-left transition hover:bg-[#f7eef1]/60 px-2 rounded-md"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-20 w-16 object-cover rounded-xs border border-[#3f1731]/10"
                />
                <div className="flex-1">
                  <span className="text-xs uppercase tracking-wider text-[#8b3e67]">
                    {p.category}
                  </span>
                  <strong className="block font-serif text-lg text-[#2a1722]">
                    {p.name}
                  </strong>
                  <span className="text-sm text-[#705b66]">
                    Rs. {p.price.toLocaleString('en-PK')}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-[#705b66]">
              No pieces found. Try another name or colour.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
