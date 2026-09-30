import React from 'react';
import { ArrowRight, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS, MOODS } from '../data/products';

interface HomePageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  navigate,
  onSelectProduct,
  onQuickAdd,
}) => {
  const freshProducts = PRODUCTS.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative mx-auto min-h-[calc(100svh-106px)] max-w-[1440px] overflow-hidden bg-[#eadde2] lg:grid lg:min-h-[720px] lg:grid-cols-[.86fr_1.14fr]">
        {/* Mobile Background Image */}
        <img
          src="/eloria-hero-v2.png"
          alt="Woman wearing ELORIA berry floral frock"
          className="absolute inset-0 h-full w-full object-cover object-[52%_center] lg:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a0d21] via-[#3f1731]/40 to-transparent lg:hidden" />

        {/* Hero Content Left */}
        <div className="relative z-10 flex min-h-[calc(100svh-106px)] flex-col justify-end px-6 pb-12 text-white sm:px-10 lg:min-h-[720px] lg:justify-center lg:px-16 lg:text-[#2b1722]">
          <p className="text-xs uppercase tracking-[.25em] text-[#f2b9d3] lg:text-[#8b3e67]">
            NEW PRINTED FROCKS
          </p>
          <h1 className="mt-4 font-serif text-[clamp(3.3rem,6vw,5.6rem)] leading-[0.95]">
            The dress you’ll{' '}
            <span className="font-light text-[#f2b9d3] lg:text-[#8b3e67]">
              reach for again.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/80 lg:text-[#6f5b66]">
            Soft printed frocks for lunches, evenings out and all the ordinary days in between.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/collections/frocks')}
              className="inline-flex h-12 items-center bg-white px-6 font-medium text-[#3f1731] transition hover:bg-neutral-100 lg:bg-[#3f1731] lg:text-white lg:hover:bg-[#2d1025]"
            >
              Shop frocks
            </button>
            <button
              onClick={() => navigate('/design-your-own')}
              className="inline-flex h-12 items-center border border-white/50 px-5 font-medium text-white transition hover:bg-white/10 lg:border-[#3f1731]/30 lg:text-[#2b1722] lg:hover:bg-[#3f1731]/5"
            >
              Custom order
            </button>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-wider text-white/70 lg:text-[#7d6874]">
            <span>Made in Pakistan</span>
            <span>&middot;</span>
            <span>Sizes XS–XL</span>
            <span>&middot;</span>
            <span>Custom length available</span>
            <span>&middot;</span>
            <span>Cash on delivery</span>
          </div>
        </div>

        {/* Hero Right Image Desktop */}
        <div className="hidden min-h-[720px] lg:block overflow-hidden bg-[#e0d0d8]">
          <img
            src="/eloria-hero-v2.png"
            alt="Woman wearing a berry floral frock"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </section>

      {/* SHOP BY MOOD */}
      <section className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 lg:py-28">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[.25em] text-[#8b3e67]">
              SHOP BY MOOD
            </p>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-[#2a1722]">
              What are you dressing for?
            </h2>
          </div>
          <p className="max-w-md leading-7 text-[#705b66]">
            Start with the day you have in mind. We’ll help with sizing or small changes before you order.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MOODS.map((mood, idx) => (
            <button
              key={mood.name}
              onClick={() => navigate(`/collections/frocks?category=${encodeURIComponent(mood.name)}`)}
              className={`group relative min-h-[430px] overflow-hidden text-left ${
                idx % 2 ? 'lg:mt-10' : ''
              }`}
            >
              <img
                src={mood.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#260b1d]/90 via-[#260b1d]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="font-serif text-3xl">{mood.name}</h3>
                <p className="mt-2 text-sm text-white/70">{mood.note}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
                  See the edit <ArrowRight size={15} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* JUST IN */}
      <section className="border-y border-[#3f1731]/10 bg-[#f7eef1] px-5 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-[#8b3e67]">JUST IN</p>
              <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-[#2a1722]">
                Fresh from the rack
              </h2>
            </div>
            <button
              onClick={() => navigate('/collections/frocks')}
              className="hidden items-center gap-2 border-b border-[#3f1731] pb-1 text-sm font-medium text-[#3f1731] hover:text-[#8b3e67] sm:flex"
            >
              View all <ArrowRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4 lg:gap-5">
            {freshProducts.map((p) => (
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
                  {p.badge && (
                    <span className="absolute left-3 top-3 bg-white/95 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#3f1731]">
                      {p.badge}
                    </span>
                  )}
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
                    Rs. {p.price.toLocaleString('en-PK')}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* NEED A SMALL CHANGE? */}
      <section className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
        <img
          src="/eloria-floral-v2.png"
          alt="Cream floral ELORIA frock"
          className="h-[420px] w-full object-cover lg:h-[600px]"
        />
        <div className="flex flex-col justify-center bg-[#3f1731] px-8 py-12 text-white sm:px-16 lg:px-20">
          <p className="text-sm uppercase tracking-[.2em] text-[#d9a5be]">
            NEED A SMALL CHANGE?
          </p>
          <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight sm:text-6xl">
            Keep the dress.
            <br />
            Change what matters.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/75">
            Prefer full sleeves? Want extra length? Every ELORIA frock can be adapted to your preference before it leaves our Bahawalpur studio.
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/design-your-own')}
              className="inline-flex h-12 items-center bg-white px-6 font-medium text-[#3f1731] transition hover:bg-neutral-100"
            >
              Start a custom order
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Details Section */}
      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-20 text-center sm:px-10 md:grid-cols-3 lg:py-28">
        <div>
          <Truck size={24} className="mx-auto text-[#8b3e67]" />
          <h3 className="mt-4 font-serif text-2xl text-[#2a1722]">
            Delivery across Pakistan
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#705b66]">
            Orders usually arrive in 3–5 working days. Made-to-order pieces take longer.
          </p>
        </div>

        <div>
          <CreditCard size={24} className="mx-auto text-[#8b3e67]" />
          <h3 className="mt-4 font-serif text-2xl text-[#2a1722]">
            Pay your way
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#705b66]">
            Cash on delivery, bank transfer, Easypaisa, JazzCash and cards.
          </p>
        </div>

        <div>
          <ShieldCheck size={24} className="mx-auto text-[#8b3e67]" />
          <h3 className="mt-4 font-serif text-2xl text-[#2a1722]">
            Help before checkout
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#705b66]">
            Unsure about size or fabric? Message us before placing the order.
          </p>
        </div>
      </section>
    </div>
  );
};
