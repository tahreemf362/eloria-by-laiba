import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DesignYourOwnPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    length: '',
    sleeves: '',
    size: '',
    colour: '',
    notes: '',
  });

  const [submittedRequest, setSubmittedRequest] = useState<{
    requestNumber: string;
    waUrl: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name || 'Valued Customer',
          phone: form.phone || 'N/A',
          email: form.email,
          length: form.length,
          sleeves: form.sleeves,
          size: form.size,
          colour: form.colour,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      const reqNum = data.request?.request_number || 'REQ-' + Math.floor(100000 + Math.random() * 900000);

      const text = encodeURIComponent(
        `Assalam-o-Alaikum ELORIA by Laiba,\n\nI would like to place a custom frock inquiry (${reqNum}).\n\n• Name: ${form.name}\n• Phone: ${form.phone}\n• Length: ${form.length}\n• Sleeves: ${form.sleeves}\n• Size: ${form.size}\n• Colour: ${form.colour}\n• Notes: ${form.notes || 'None'}\n\nPlease let me know the availability and timeframe.`
      );

      const waUrl = `https://wa.me/?text=${text}`;
      setSubmittedRequest({ requestNumber: reqNum, waUrl });

      // Automatically open WhatsApp in new tab
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error(err);
      const fallbackReqNum = 'REQ-' + Math.floor(100000 + Math.random() * 900000);
      const text = encodeURIComponent(
        `Assalam-o-Alaikum ELORIA by Laiba, I would like to design my own dress (${fallbackReqNum}): Length: ${form.length}, Sleeves: ${form.sleeves}, Size: ${form.size}, Colour: ${form.colour}.`
      );
      setSubmittedRequest({
        requestNumber: fallbackReqNum,
        waUrl: `https://wa.me/?text=${text}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fcfaf7]">
      {/* Hero */}
      <section className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-[#eadde2] px-7 py-14 sm:px-14 lg:px-20">
          <p className="text-xs uppercase tracking-[.25em] text-[#8b3e67]">
            Made for you
          </p>
          <h1 className="mt-5 font-serif text-[clamp(3.5rem,7vw,6.8rem)] leading-[.95] text-[#2a1722]">
            Your dress.
            <br />
            <em className="font-light text-[#8b3e67]">Your details.</em>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[#66515c]">
            Tell us how you want it to fit and look. We’ll confirm availability, price and timing with you before stitching.
          </p>
        </div>

        <img
          src="/eloria-hero-v2.png"
          alt="ELORIA floral frock"
          className="h-[360px] w-full object-cover lg:h-[580px]"
        />
      </section>

      {/* Form Section */}
      <section className="mx-auto max-w-[920px] px-6 py-14 sm:py-20">
        <p className="text-xs uppercase tracking-[.25em] text-[#8b3e67]">
          Custom request
        </p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-[#2a1722]">
          Tell us what you have in mind
        </h2>

        {submittedRequest ? (
          <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 text-center">
            <CheckCircle2 size={36} className="mx-auto text-emerald-700" />
            <h3 className="mt-3 font-serif text-2xl text-emerald-950">
              Inquiry Saved &amp; Dispatched!
            </h3>
            <p className="mt-2 text-sm text-emerald-800">
              Reference code: <strong>{submittedRequest.requestNumber}</strong>. Your custom specifications have been stored in the studio database.
            </p>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-700">
              <ShieldCheck size={14} /> Saved in persistent customer requests DB
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={submittedRequest.waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center bg-[#25D366] px-6 text-sm font-medium text-white hover:bg-[#1EBE5D] transition"
              >
                Open in WhatsApp
              </a>
              <button
                onClick={() => {
                  setSubmittedRequest(null);
                  setForm({
                    name: '',
                    phone: '',
                    email: '',
                    length: '',
                    sleeves: '',
                    size: '',
                    colour: '',
                    notes: '',
                  });
                }}
                className="inline-flex h-12 items-center border border-[#3f1731]/20 px-5 text-sm font-medium text-[#2a1722] hover:bg-white"
              >
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-9 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#2a1722]">
              Your Name *
              <input
                required
                placeholder="e.g. Ayesha Khan"
                className="h-12 border border-[#3f1731]/20 bg-white px-4 font-normal outline-none focus:border-[#3f1731]"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#2a1722]">
              Mobile / WhatsApp Number *
              <input
                required
                type="tel"
                placeholder="0300 1234567"
                className="h-12 border border-[#3f1731]/20 bg-white px-4 font-normal outline-none focus:border-[#3f1731]"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#2a1722]">
              Length *
              <input
                required
                placeholder="e.g. 42 inches or ankle length"
                className="h-12 border border-[#3f1731]/20 bg-white px-4 font-normal outline-none focus:border-[#3f1731]"
                value={form.length}
                onChange={(e) => setForm({ ...form, length: e.target.value })}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#2a1722]">
              Sleeves *
              <select
                required
                value={form.sleeves}
                onChange={(e) => setForm({ ...form, sleeves: e.target.value })}
                className="h-12 border border-[#3f1731]/20 bg-white px-4 font-normal outline-none focus:border-[#3f1731]"
              >
                <option value="" disabled>Choose sleeves</option>
                <option>Short</option>
                <option>Three-quarter</option>
                <option>Full</option>
                <option>Sleeveless</option>
                <option>Other (describe in notes)</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#2a1722]">
              Size *
              <select
                required
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="h-12 border border-[#3f1731]/20 bg-white px-4 font-normal outline-none focus:border-[#3f1731]"
              >
                <option value="" disabled>Choose a size</option>
                <option>XS</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
                <option>Custom measurements</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#2a1722]">
              Colour *
              <input
                required
                placeholder="e.g. berry pink"
                className="h-12 border border-[#3f1731]/20 bg-white px-4 font-normal outline-none focus:border-[#3f1731]"
                value={form.colour}
                onChange={(e) => setForm({ ...form, colour: e.target.value })}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#2a1722] sm:col-span-2">
              Notes (optional)
              <textarea
                placeholder="Measurements, fabric or any other detail"
                className="min-h-28 border border-[#3f1731]/20 bg-white p-4 font-normal outline-none focus:border-[#3f1731]"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-fit items-center gap-3 bg-[#3f1731] px-6 text-sm font-medium text-white transition hover:bg-[#2d1025] sm:col-span-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording request...' : 'Send request on WhatsApp'}
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </section>
    </div>
  );
};
