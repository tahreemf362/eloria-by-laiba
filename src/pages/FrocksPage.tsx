import React, { useState } from 'react';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

interface FrocksPageProps {
  initialCategory?: string;
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size?: string) => void;
}

export const FrocksPage: React.FC<FrocksPageProps> = ({
  initialCategory,
  navigate,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || 'All frocks'
  );
  const [sortBy, setSortBy] = useState<'featured' | 'low-high' | 'high-low'>('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const categories = ['All frocks', 'Everyday', 'Evening', 'Florals', 'Made to order'];

  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedCategory === 'All frocks') return true;
    if (selectedCategory === 'Everyday') return p.category.toLowerCase().includes('everyday') || p.category.toLowerCase().includes('cotton');
    if (selectedCategory === 'Evening') return p.category.toLowerCase().includes('evening');
    if (selectedCategory === 'Florals') return p.category.toLowerCase().includes('floral');
    if (selectedCategory === 'Made to order') return p.category.toLowerCase().includes('made') || p.category.toLowerCase().includes('custom') || p.badge === 'Made to order';
    return true;
  }).sort((a, b) => {
    if (sortBy === 'low-high') return a.price - b.price;
    if (sortBy === 'high-low') return b.price - a.price;
    return 0;
  });

  return (
    <div className="bg-[#fcfaf7]">
      {/* Header */}
      <section className="mx-auto max-w-[1440px] px-5 pt-12 pb-8 sm:px-10 lg:pt-16 lg:pb-12 text-center md:text-left">
        <p className="text-xs uppercase tracking-[.25em] text-[#8b3e67]">
          PRINTED FROCKS
        </p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl text-[#2a1722]">
          Easy to wear. Hard to forget.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#705b66]">
          Full skirts, soft cotton and the kind of prints that work beyond one occasion.
        </p>
      </section>

      {/* Filter Tabs & Products */}
      <section className="mx-auto max-w-[1440px] px-5 sm:px-10 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'border-[#3f1731] bg-[#3f1731] text-white shadow-xs'
                  : 'border-[#3f1731]/15 bg-white text-[#2a1722] hover:border-[#3f1731]'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Refine Dropdown */}
          <div className="relative ml-auto hidden lg:block">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 border-b border-[#3f1731] pb-1 text-sm font-medium text-[#2a1722]"
            >
              <SlidersHorizontal size={16} /> Refine
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-md border border-[#3f1731]/15 bg-white p-2 shadow-lg text-xs">
                <button
                  onClick={() => {
                    setSortBy('featured');
                    setShowSortDropdown(false);
                  }}
                  className={`w-full p-2 text-left hover:bg-[#f7eef1] ${
                    sortBy === 'featured' ? 'font-bold text-[#8b3e67]' : ''
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => {
                    setSortBy('low-high');
                    setShowSortDropdown(false);
                  }}
                  className={`w-full p-2 text-left hover:bg-[#f7eef1] ${
                    sortBy === 'low-high' ? 'font-bold text-[#8b3e67]' : ''
                  }`}
                >
                  Price: Low to High
                </button>
                <button
                  onClick={() => {
                    setSortBy('high-low');
                    setShowSortDropdown(false);
                  }}
                  className={`w-full p-2 text-left hover:bg-[#f7eef1] ${
                    sortBy === 'high-low' ? 'font-bold text-[#8b3e67]' : ''
                  }`}
                >
                  Price: High to Low
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 pb-20">
          {filteredProducts.map((p) => (
            <article
              key={p.id}
              className="group cursor-pointer"
              onClick={() => onSelectProduct(p)}
            >
              <div className="relative overflow-hidden bg-white">
                <img
                  src={p.image}
                  alt={p.name}
                  className="aspect-[3/4] h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                />
                
                {p.badge ? (
                  <span className="absolute left-3 top-3 bg-white/95 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#3f1731]">
                    {p.badge}
                  </span>
                ) : p.customisable ? (
                  <span className="absolute left-3 top-3 bg-white/95 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#8b3e67]">
                    Customisable
                  </span>
                ) : null}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd(p, 'M');
                  }}
                  className="absolute inset-x-3 bottom-3 translate-y-16 bg-white/95 py-3 font-medium text-[#2a1722] shadow-lg transition group-hover:translate-y-0 focus:translate-y-0 text-sm hover:bg-[#3f1731] hover:text-white"
                >
                  Quick add — M
                </button>
              </div>

              <p className="mt-4 text-xs uppercase tracking-[.12em] text-[#856d7a]">
                {p.category}
              </p>
              <div className="mt-1 sm:flex sm:justify-between sm:gap-2">
                <h3 className="font-serif text-lg text-[#2a1722]">{p.name}</h3>
                <p className="mt-1 shrink-0 text-sm font-semibold text-[#2a1722] sm:mt-0">
                  {p.id === 8 ? 'Rs. From 9,500' : `Rs. ${p.price.toLocaleString('en-PK')}`}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* LOOKING FOR SOMETHING SPECIFIC? */}
      <section className="border-t border-[#3f1731]/10 bg-[#f1e5e9] px-6 py-16 text-center sm:px-10">
        <div className="mx-auto max-w-xl">
          <p className="text-xs uppercase tracking-[.25em] text-[#8b3e67]">
            LOOKING FOR SOMETHING SPECIFIC?
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-[#2a1722]">
            Send us the shape, colour and length.
          </h2>
          <div className="mt-6">
            <button
              onClick={() => navigate('/design-your-own')}
              className="inline-flex items-center gap-2 bg-[#3f1731] px-6 py-3 font-medium text-white transition hover:bg-[#2d1025]"
            >
              Start a custom order <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
