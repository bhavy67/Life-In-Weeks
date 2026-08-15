import { useState } from 'react';

const QUOTES = [
  "The days are long, but the years are short.",
  "Someday is not a day of the week.",
  "None of us know how many squares remain.",
  "One day, there will be a last time for everything.",
  "Time doesn't wait for you to feel ready.",
  "The future is unwritten. The past is spent.",
  "Everything ends. That's what makes it matter.",
  "Whatever you're waiting for — stop waiting.",
  "The present will always have been.",
  "Uncertainty is just the future with the lights off.",
  "Today is somebody's last day on earth.",
  "Each filled square is a week you'll never relive.",
  "The clock runs whether you watch it or not.",
  "We're all on borrowed time. Spend it well.",
  "The life you live is the life you choose.",
  "Time passes whether or not you're paying attention.",
  "Every year, the grid fills a little more.",
  "The only certainty is that nothing stays certain.",
  "Life is fragile. Don't treat it like it isn't.",
  "A week goes by whether you use it or not.",
  "You will have lived a whole life without noticing.",
  "The world won't wait for your hesitation.",
  "You are always either building or letting decay.",
  "Most of your life is already behind you.",
];

export default function QuoteFooter() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

  const next = () => setIndex((i) => (i + 1) % QUOTES.length);

  return (
    <footer className="flex-shrink-0 border-t border-[var(--border-faint)] px-4 sm:px-6 py-2.5">
      <p
        key={index}
        onClick={next}
        title="Click for another"
        className="text-[var(--text-muted)] text-[11px] text-center tracking-wide select-none cursor-pointer hover:text-[var(--text-tertiary)] transition-colors duration-200 fade-in"
      >
        {QUOTES[index]}
      </p>
    </footer>
  );
}
