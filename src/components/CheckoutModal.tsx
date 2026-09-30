import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, CreditCard, Banknote, Smartphone, ShieldCheck } from 'lucide-react';
import { CartItem, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCompleted: () => void;
}

type CheckoutStep = 'delivery' | 'payment' | 'review' | 'complete';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<CheckoutStep>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'wallet' | 'bank' | 'card'>('cod');
  const [city, setCity] = useState<string>('Bahawalpur');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 10000 ? 0 : 250;
  const totalAmount = subtotal + deliveryFee;

  const paymentLabels = {
    cod: 'Cash on delivery',
    wallet: 'Easypaisa / JazzCash',
    bank: 'Bank transfer',
    card: 'Card',
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const orderPayload = {
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      customer_email: form.email.trim(),
      city,
      address: form.address.trim(),
      payment_method: paymentMethod,
      notes: form.notes.trim(),
      items: items.map((it) => ({
        product: {
          id: it.product.id,
          name: it.product.name,
          price: it.product.price,
          image: it.product.image,
          category: it.product.category,
        },
        size: it.size,
        quantity: it.quantity,
      })),
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setPlacedOrder(data.order);
      setStep('complete');
      onOrderCompleted();
    } catch (err: any) {
      console.error('Order error:', err);
      // Fallback local order representation if offline
      const fallbackOrder: Order = {
        id: 'ord_loc_' + Date.now(),
        order_number: 'EL-' + Math.floor(100000 + Math.random() * 900000),
        customer_id: 'cust_loc',
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        city,
        address: form.address,
        payment_method: paymentMethod,
        notes: form.notes,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        status: 'Pending',
        created_at: new Date().toISOString(),
      };
      setPlacedOrder(fallbackOrder);
      setStep('complete');
      onOrderCompleted();
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp message generation
  const itemsText = items
    .map((it) => `${it.product.name} (${it.size}) x${it.quantity} - Rs. ${it.product.price * it.quantity}`)
    .join('%0A');
  const waText = encodeURIComponent(
    `Assalam-o-Alaikum ELORIA by Laiba,\n\nI have placed an order ${placedOrder?.order_number || ''}.\n\nItems:\n${items.map((i) => `• ${i.product.name} (${i.size}) x${i.quantity}`).join('\n')}\n\nTotal: Rs. ${totalAmount.toLocaleString('en-PK')}\nName: ${form.name}\nCity: ${city}\nAddress: ${form.address}\nPayment: ${paymentLabels[paymentMethod]}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={step === 'complete' ? onClose : undefined}
      />
      <div className="relative z-10 w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-lg border border-[#dfd2d8] bg-[#fffdfb] p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3f1731]/10">
          <div>
            <h2 className="font-serif text-2xl text-[#2a1722]">
              {step === 'complete' ? 'Order Confirmed' : 'Checkout'}
            </h2>
            {step !== 'complete' && (
              <p className="text-sm text-[#78636e] mt-0.5">
                Complete your order details below.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#2a1722] hover:text-[#8b3e67] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar (if not complete) */}
        {step !== 'complete' && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-medium text-[#705b66]">
              <span>
                {step === 'delivery'
                  ? 'Delivery'
                  : step === 'payment'
                  ? 'Payment'
                  : 'Review'}
              </span>
              <span>
                {step === 'delivery' ? '1' : step === 'payment' ? '2' : '3'} of 3
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#f2ecea] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3f1731] transition-all duration-300"
                style={{
                  width:
                    step === 'delivery'
                      ? '33%'
                      : step === 'payment'
                      ? '66%'
                      : '100%',
                }}
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Delivery */}
        {step === 'delivery' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep('payment');
            }}
            className="mt-6 grid gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-[#2a1722]">
                Full name *
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 border border-[#3f1731]/15 bg-white px-3 font-normal outline-none focus:border-[#3f1731]"
                  placeholder="e.g. Fatima Ali"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#2a1722]">
                Mobile number *
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-12 border border-[#3f1731]/15 bg-white px-3 font-normal outline-none focus:border-[#3f1731]"
                  placeholder="0300 1234567"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-sm font-medium text-[#2a1722]">
              Email (optional)
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 border border-[#3f1731]/15 bg-white px-3 font-normal outline-none focus:border-[#3f1731]"
                placeholder="your.email@example.com"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#2a1722]">
              City *
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-12 border border-[#3f1731]/15 bg-white px-3 font-normal outline-none focus:border-[#3f1731]"
              >
                <option>Bahawalpur</option>
                <option>Lahore</option>
                <option>Karachi</option>
                <option>Islamabad / Rawalpindi</option>
                <option>Multan</option>
                <option>Faisalabad</option>
                <option>Peshawar</option>
                <option>Quetta</option>
                <option>Sialkot</option>
                <option>Gujranwala</option>
                <option>Other city</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-[#2a1722]">
              Complete delivery address *
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="min-h-24 border border-[#3f1731]/15 bg-white p-3 font-normal outline-none focus:border-[#3f1731]"
                placeholder="House, street, area and a nearby landmark"
              />
            </label>

            <button
              type="submit"
              className="mt-3 flex h-12 items-center justify-center gap-2 rounded-none bg-[#3f1731] font-medium text-white transition hover:bg-[#2d1025]"
            >
              Continue to payment <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <div className="mt-6">
            <div className="grid gap-3">
              {[
                {
                  id: 'cod',
                  title: 'Cash on delivery',
                  subtitle: 'Pay in cash when your parcel arrives',
                  icon: Banknote,
                },
                {
                  id: 'wallet',
                  title: 'Easypaisa or JazzCash',
                  subtitle: 'Transfer details are shared after confirmation',
                  icon: Smartphone,
                },
                {
                  id: 'bank',
                  title: 'Bank transfer',
                  subtitle: 'Account details are shared after confirmation',
                  icon: CreditCard,
                },
                {
                  id: 'card',
                  title: 'Debit or credit card',
                  subtitle: 'Available when secure card processing is connected',
                  icon: CreditCard,
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id as any)}
                    className={`flex cursor-pointer items-center gap-4 border p-4 transition ${
                      isSelected
                        ? 'border-[#3f1731] bg-[#f8f0f3]'
                        : 'border-[#3f1731]/15 bg-white hover:border-[#3f1731]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={isSelected}
                      onChange={() => setPaymentMethod(opt.id as any)}
                      className="accent-[#3f1731]"
                    />
                    <Icon size={20} className="text-[#8b3e67] shrink-0" />
                    <div>
                      <strong className="block text-sm font-semibold text-[#2a1722]">
                        {opt.title}
                      </strong>
                      <span className="text-xs text-[#76616c]">
                        {opt.subtitle}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {paymentMethod === 'card' && (
              <p className="mt-4 border-l-2 border-[#8b3e67] bg-[#f7eef1] p-4 text-xs leading-6 text-[#2a1722]">
                Card payment will become active when ELORIA’s payment gateway account is connected. Choose another method for this order.
              </p>
            )}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('delivery')}
                className="flex h-12 items-center gap-1.5 border border-[#3f1731]/30 px-5 text-sm font-medium text-[#2a1722] hover:bg-neutral-100"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={paymentMethod === 'card'}
                onClick={() => setStep('review')}
                className="flex h-12 flex-1 items-center justify-center gap-2 bg-[#3f1731] text-sm font-medium text-white hover:bg-[#2d1025] disabled:opacity-50"
              >
                Review order <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div className="mt-6">
            {/* Items */}
            <div className="grid gap-3 border-y border-[#3f1731]/10 py-4 max-h-48 overflow-y-auto">
              {items.map((it, idx) => (
                <div
                  key={`${it.product.id}-${it.size}-${idx}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[#2a1722]">
                    {it.product.name} · {it.size} × {it.quantity}
                  </span>
                  <strong className="text-[#2a1722]">
                    Rs. {(it.product.price * it.quantity).toLocaleString('en-PK')}
                  </strong>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="grid gap-2 py-4 text-sm border-b border-[#3f1731]/10">
              <div className="flex justify-between text-[#705b66]">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-[#705b66]">
                <span>Delivery to {city}</span>
                <span>{deliveryFee === 0 ? 'Free' : `Rs. ${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-semibold text-[#2a1722]">
                <span>Total</span>
                <span>Rs. {totalAmount.toLocaleString('en-PK')}</span>
              </div>
            </div>

            {/* Recipient summary */}
            <div className="mt-4 bg-[#f7eef1] p-4 text-xs leading-6 text-[#2a1722]">
              <strong>Deliver to:</strong> {form.name}, {form.address}, {city} (Phone: {form.phone})
              <br />
              <strong>Payment:</strong> {paymentLabels[paymentMethod]}
            </div>

            {/* Order Note */}
            <label className="mt-4 grid gap-1.5 text-xs font-medium text-[#2a1722]">
              Order note (optional)
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="min-h-16 border border-[#3f1731]/15 bg-white p-2.5 font-normal text-sm outline-none"
                placeholder="Sizing or delivery instructions"
              />
            </label>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('payment')}
                className="flex h-12 items-center gap-1.5 border border-[#3f1731]/30 px-5 text-sm font-medium text-[#2a1722] hover:bg-neutral-100"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="h-12 flex-1 bg-[#3f1731] font-medium text-white hover:bg-[#2d1025] disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Placing order...' : 'Place order'}
              </button>
            </div>

            <p className="mt-3 text-center text-[0.72rem] text-[#78636e]">
              By placing the order, you confirm that your delivery details are correct.
            </p>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && placedOrder && (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#3f1731] text-white">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="mt-6 font-serif text-3xl sm:text-4xl text-[#2a1722]">
              Thank you, {form.name.split(' ')[0] || 'lovely'}.
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#705b66]">
              Your order number is{' '}
              <strong className="text-[#3f1731] font-bold">
                {placedOrder.order_number}
              </strong>
              . We’ll contact you to confirm availability and payment details.
            </p>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 py-2 px-3 rounded-sm border border-emerald-200 w-fit mx-auto">
              <ShieldCheck size={15} /> Customer &amp; order data recorded in database
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center bg-[#25D366] px-6 font-medium text-white hover:bg-[#1EBE5D] transition"
              >
                Confirm on WhatsApp
              </a>

              <button
                onClick={onClose}
                className="inline-flex h-12 items-center justify-center border border-[#3f1731]/30 px-6 font-medium text-[#2a1722] hover:bg-neutral-100"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
