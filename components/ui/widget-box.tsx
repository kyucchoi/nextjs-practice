interface WidgetBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function WidgetBox({ children, className = '' }: WidgetBoxProps) {
  return (
    <div
      className={`flex w-auto flex-col gap-4 rounded-b-lg border p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
