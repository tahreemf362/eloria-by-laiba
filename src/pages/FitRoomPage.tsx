import React, { useState } from 'react';
import { CircleCheck, ArrowRight, Sparkles } from 'lucide-react';

interface FitRoomPageProps {
  navigate: (path: string) => void;
}

export const FitRoomPage: React.FC<FitRoomPageProps> = ({ navigate }) => {
  const [bustInput, setBustInput] = useState<string>('');
  const [waistInput, setWaistInput] = useState<string>('');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const calculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const bust = parseFloat(bustInput);
    if (!bust || isNaN(bust)) {
      setCalcResult('Please enter your bust measurement in inches.');
      return;
    }

    if (bust <= 35) setCalcResult('Recommended Size: XS (Extra Small)');
    else if (bust <= 37.5) setCalcResult('Recommended Size: S (Small)');
    else if (bust <= 40.5) setCalcResult('Recommended Size: M (Medium) — Most common');
    else if (bust <= 43.5) setCalcResult('Recommended Size: L (Large)');
    else if (bust <= 47) setCalcResult('Recommended Size: XL (Extra Large)');
    else setCalcResult('Recommended: Custom Tailored (Choose "Custom measurements" in Design Your Own)');
  };

  return (
    <div className="bg-[#fcfaf7]">
      {/* Hero Section */}
      <section className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.05fr_.95fr]">
        <div className="flex min-h-[560px] flex-col justify-center px-7 py-16 sm:px-14 lg:px-20">
          <p className="text-xs uppercase tracking-[.25em] text-[#8b3e67]">
            The Fit Room
          </p>
          <h1 className="mt-5 font-serif text-[clamp(3.6rem,7vw,7rem)] leading-[.9] text-[#2a1722]">
            Measure once.
            <br />
            <em className="font-light text-[#8b3e67]">Feel good all day.</em>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#6d5963]">
            A better fit begins with six simple measurements. Wear light clothing, stand naturally and ask someone to help where possible.
          </p>
        </div>

        <div className="min-h-[540px] bg-[#3f1731] p-8 sm:p-14">
          <div className="flex h-full flex-col justify-between border border-white/15 p-7 text-white sm:p-10">
            <p className="text-xs uppercase tracking-[.2em] text-white/45">
              Before you begin
            </p>
            <div className="space-y-5 my-6">
              <p className="flex items-center gap-3 font-serif text-xl sm:text-2xl">
                <CircleCheck size={20} className="text-[#d6a5bc] shrink-0" />
                Use a soft measuring tape
              </p>
              <p className="flex items-center gap-3 font-serif text-xl sm:text-2xl">
                <CircleCheck size={20} className="text-[#d6a5bc] shrink-0" />
                Keep the tape level—not tight
              </p>
              <p className="flex items-center gap-3 font-serif text-xl sm:text-2xl">
                <CircleCheck size={20} className="text-[#d6a5bc] shrink-0" />
                Record in inches
              </p>
              <p className="flex items-center gap-3 font-serif text-xl sm:text-2xl">
                <CircleCheck size={20} className="text-[#d6a5bc] shrink-0" />
                Measure twice before sending
              </p>
            </div>
            <p className="text-sm leading-6 text-white/55">
              No measuring tape? Send us the measurements of a similar garment that fits you well.
            </p>
          </div>
        </div>
      </section>

      {/* Six-Point Guide */}
      <section className="mx-auto max-w-[1100px] px-6 py-20 lg:py-28">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[.2em] text-[#8b3e67]">
            Your six-point fit
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-[#2a1722]">
            A simple measurement guide
          </h2>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden border border-[#3f1731]/10 bg-[#3f1731]/10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-7">
            <span className="text-xs text-[#a17a8e] font-semibold">01</span>
            <h3 className="mt-4 font-serif text-2xl text-[#2a1722]">Bust</h3>
            <p className="mt-3 text-sm leading-6 text-[#705c66]">
              Around the fullest part, keeping the tape comfortably level.
            </p>
          </div>

          <div className="bg-white p-7">
            <span className="text-xs text-[#a17a8e] font-semibold">02</span>
            <h3 className="mt-4 font-serif text-2xl text-[#2a1722]">Waist</h3>
            <p className="mt-3 text-sm leading-6 text-[#705c66]">
              Around your natural waist—do not pull the tape too tightly.
            </p>
          </div>

          <div className="bg-white p-7">
            <span className="text-xs text-[#a17a8e] font-semibold">03</span>
            <h3 className="mt-4 font-serif text-2xl text-[#2a1722]">Shoulder</h3>
            <p className="mt-3 text-sm leading-6 text-[#705c66]">
              From one shoulder edge to the other across the back.
            </p>
          </div>

          <div className="bg-white p-7">
            <span className="text-xs text-[#a17a8e] font-semibold">04</span>
            <h3 className="mt-4 font-serif text-2xl text-[#2a1722]">Frock length</h3>
            <p className="mt-3 text-sm leading-6 text-[#705c66]">
              From the highest shoulder point to your preferred finished length.
            </p>
          </div>

          <div className="bg-white p-7">
            <span className="text-xs text-[#a17a8e] font-semibold">05</span>
            <h3 className="mt-4 font-serif text-2xl text-[#2a1722]">Sleeve</h3>
            <p className="mt-3 text-sm leading-6 text-[#705c66]">
              From shoulder edge to wrist, with the arm slightly relaxed.
            </p>
          </div>

          <div className="bg-white p-7">
            <span className="text-xs text-[#a17a8e] font-semibold">06</span>
            <h3 className="mt-4 font-serif text-2xl text-[#2a1722]">Armhole</h3>
            <p className="mt-3 text-sm leading-6 text-[#705c66]">
              Around the shoulder joint with enough room to move comfortably.
            </p>
          </div>
        </div>

        {/* Quick Size Calculator */}
        <div className="mt-14 rounded-lg border border-[#3f1731]/15 bg-white p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8b3e67] font-semibold">
            <Sparkles size={16} /> Instant Size Estimator
          </div>
          <h3 className="mt-2 font-serif text-2xl text-[#2a1722]">
            Not sure between two sizes?
          </h3>
          <p className="mt-1 text-sm text-[#705b66]">
            Enter your bust measurement in inches to see our standard recommendation.
          </p>

          <form onSubmit={calculateSize} className="mt-6 flex flex-wrap items-end gap-4">
            <label className="grid gap-1 text-xs font-medium text-[#2a1722]">
              Bust (inches)
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 38"
                value={bustInput}
                onChange={(e) => setBustInput(e.target.value)}
                className="h-11 w-36 border border-[#3f1731]/20 px-3 text-sm outline-none focus:border-[#3f1731]"
              />
            </label>

            <label className="grid gap-1 text-xs font-medium text-[#2a1722]">
              Waist (optional inches)
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 32"
                value={waistInput}
                onChange={(e) => setWaistInput(e.target.value)}
                className="h-11 w-36 border border-[#3f1731]/20 px-3 text-sm outline-none focus:border-[#3f1731]"
              />
            </label>

            <button
              type="submit"
              className="h-11 bg-[#3f1731] px-5 text-sm font-medium text-white transition hover:bg-[#2d1025]"
            >
              Calculate Size
            </button>
          </form>

          {calcResult && (
            <div className="mt-4 rounded bg-[#f7eef1] p-4 text-sm font-medium text-[#3f1731]">
              {calcResult}
            </div>
          )}
        </div>

        {/* Co-Create CTA Box */}
        <div className="mt-12 flex flex-col items-center bg-[#f1e5e9] p-10 text-center">
          <h3 className="font-serif text-3xl text-[#2a1722]">
            Still unsure about your fit?
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#705c66]">
            Choose “Not sure” in the design room and we’ll guide you through the measurements personally.
          </p>
          <button
            onClick={() => navigate('/design-your-own')}
            className="mt-6 flex items-center gap-2 border-b border-[#3f1731] pb-1 text-sm font-medium text-[#3f1731] hover:text-[#8b3e67]"
          >
            Visit the co-create room <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
};
