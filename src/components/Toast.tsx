interface Props {
  message: string;
}

export default function Toast({ message }: Props) {
  return (
    <div className="fixed bottom-16 inset-x-0 flex justify-center z-[200] pointer-events-none">
      <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-elevated)] rounded-full px-4 py-2 text-sm text-[var(--text-secondary)] shadow-xl toast-show">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--progress-fill)] flex-shrink-0" />
        {message}
      </div>
    </div>
  );
}
