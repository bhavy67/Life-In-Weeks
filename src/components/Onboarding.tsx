import { useState } from 'react';
import type { UserConfig } from '../types';

interface Props {
  onComplete: (user: UserConfig) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [lifespan, setLifespan] = useState(80);
  const [step, setStep] = useState(0);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = () => {
    if (!name.trim() || !birthday) return;
    onComplete({ name: name.trim(), birthday, lifespan });
  };

  const steps = [
    {
      label: 'What should we call you?',
      sub: 'This is your space.',
      content: (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(1)}
          placeholder="Your name"
          autoFocus
          className="w-full bg-transparent border-b border-[#333] text-2xl sm:text-3xl text-white placeholder:text-[#444] focus:outline-none focus:border-[#666] pb-2 transition-colors text-center"
        />
      ),
      canProceed: name.trim().length > 0,
    },
    {
      label: `When were you born, ${name.split(' ')[0]}?`,
      sub: 'We use this to map your weeks.',
      content: (
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          min={minDateStr}
          max={maxDateStr}
          autoFocus
          className="bg-transparent border-b border-[#333] text-2xl sm:text-3xl text-white focus:outline-none focus:border-[#666] pb-2 transition-colors text-center w-full [color-scheme:dark]"
        />
      ),
      canProceed: birthday.length > 0,
    },
    {
      label: 'How long do you expect to live?',
      sub: 'You can always change this later.',
      content: (
        <div className="w-full space-y-6">
          <div className="text-5xl sm:text-6xl font-light text-white text-center">
            {lifespan} <span className="text-[#555] text-2xl">years</span>
          </div>
          <input
            type="range"
            min={50}
            max={120}
            value={lifespan}
            onChange={(e) => setLifespan(Number(e.target.value))}
            className="w-full accent-white"
          />
          <div className="flex justify-between text-xs text-[#444]">
            <span>50</span>
            <span>120</span>
          </div>
        </div>
      ),
      canProceed: true,
    },
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md fade-in">
        {/* Logo / title */}
        <div className="mb-12 text-center">
          <div className="text-[#333] text-xs tracking-[0.3em] uppercase mb-3">Life in Weeks</div>
          <div className="flex justify-center gap-[2px]">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-[6px] h-[6px] rounded-[1px]"
                style={{ background: i < 4 ? '#3a3a3a' : '#1a1a1a' }}
              />
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 justify-center mb-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-[2px] w-8 rounded-full transition-colors duration-300"
              style={{ background: i <= step ? '#555' : '#1f1f1f' }}
            />
          ))}
        </div>

        {/* Question */}
        <div className="text-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-light text-white mb-2">
            {current.label}
          </h1>
          <p className="text-[#555] text-sm">{current.sub}</p>
        </div>

        {/* Input */}
        <div className="mt-8 mb-10">{current.content}</div>

        {/* Actions */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3 rounded-lg border border-[#222] text-[#666] hover:text-[#999] hover:border-[#333] transition-colors text-sm"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!current.canProceed}
              className="flex-1 py-3 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !birthday}
              className="flex-1 py-3 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Show my life
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
