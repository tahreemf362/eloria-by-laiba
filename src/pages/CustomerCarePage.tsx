import React from 'react';
import { Truck, CreditCard, RefreshCcw, PackageCheck, MessageCircle } from 'lucide-react';

export const CustomerCarePage: React.FC = () => {
  return (
    <div className="bg-[#fcfaf7]">
      {/* Hero */}
      <section className="bg-[#f1e5e9] px-6 py-20 text-center lg:py-28">
        <p className="text-xs uppercase tracking-[.25em] text-[#8b3e67]">
          CUSTOMER CARE
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl font-serif text-[clamp(3.5rem,8vw,7rem)] leading-[.9] text-[#2a1722]">
          Everything you need
          <br />
          <em className="font-light text-[#8b3e67]">before you order.</em>
        </h1>
      </section>

      {/* 4 Policy Articles */}
      <section className="mx-auto grid max-w-[1100px] gap-px bg-[#3f1731]/10 px-5 py-20 sm:grid-cols-2 sm:px-10 lg:py-28">
        <article className="bg-white p-8 sm:p-10">
          <Truck size={24} className="text-[#8b3e67]" />
          <h2 className="mt-7 font-serif text-3xl text-[#2a1722]">Delivery</h2>
          <p className="mt-4 leading-7 text-[#705b66]">
            Ready pieces usually arrive within 3–5 working days across Pakistan. Custom orders are given a separate timeline when the design is confirmed.
          </p>
        </article>

        <article className="bg-white p-8 sm:p-10">
          <CreditCard size={24} className="text-[#8b3e67]" />
          <h2 className="mt-7 font-serif text-3xl text-[#2a1722]">Payments</h2>
          <p className="mt-4 leading-7 text-[#705b66]">
            Choose cash on delivery, bank transfer, Easypaisa or JazzCash at checkout. Card payments will appear once ELORIA’s secure gateway is connected.
          </p>
        </article>

        <article className="bg-white p-8 sm:p-10">
          <RefreshCcw size={24} className="text-[#8b3e67]" />
          <h2 className="mt-7 font-serif text-3xl text-[#2a1722]">Size exchanges</h2>
          <p className="mt-4 leading-7 text-[#705b66]">
            Contact us within 3 days of delivery if a ready-to-wear piece needs a different size. The item must be unworn, unwashed and in its original condition.
          </p>
        </article>

        <article className="bg-white p-8 sm:p-10">
          <PackageCheck size={24} className="text-[#8b3e67]" />
          <h2 className="mt-7 font-serif text-3xl text-[#2a1722]">Custom orders</h2>
          <p className="mt-4 leading-7 text-[#705b66]">
            Because custom pieces are made to your measurements, they cannot be exchanged for change of mind. We confirm every detail before work begins.
          </p>
        </article>
      </section>

      {/* Still unsure */}
      <section className="mx-auto max-w-[900px] px-6 pb-24 text-center">
        <MessageCircle size={26} className="mx-auto text-[#8b3e67]" />
        <h2 className="mt-5 font-serif text-4xl text-[#2a1722]">Still unsure?</h2>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-[#705b66]">
          Send us your question, measurements or a screenshot of the piece you like.
        </p>
        <a
          href="https://wa.me/?text=Assalam-o-Alaikum%20ELORIA%20by%20Laiba%2C%20I%20need%20help%20with%20an%20order."
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex bg-[#3f1731] px-6 py-3 font-medium text-white transition hover:bg-[#2d1025]"
        >
          Chat on WhatsApp
        </a>
      </section>
    </div>
  );
};
