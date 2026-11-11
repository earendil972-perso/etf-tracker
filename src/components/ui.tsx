import { forwardRef, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-700 bg-slate-800/60 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-slate-700 px-4 py-3">
      <h3 className="font-semibold text-slate-100">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "destructive" | "ghost" };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "default", ...props },
  ref
) {
  const variants: Record<string, string> = {
    default: "bg-indigo-600 text-white hover:bg-indigo-500",
    outline: "border border-slate-600 bg-transparent text-slate-200 hover:bg-slate-700/60",
    destructive: "bg-red-600/90 text-white hover:bg-red-500",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-700/60",
  };
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = "", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`}
      {...props}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className = "", children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={`rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

export function Label({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium text-slate-400">{children}</span>;
}

const MONTH_LABELS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function monthInputSupported(): boolean {
  if (typeof document === "undefined") return false;
  const input = document.createElement("input");
  input.type = "month";
  return input.type === "month";
}

export function MonthInput({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  if (monthInputSupported()) {
    return <Input type="month" value={value} onChange={(e) => onChange(e.target.value)} className={className} />;
  }
  const [y, m] = value.split("-");
  const currentYear = new Date().getFullYear();
  const year = Number(y) || currentYear;
  const month = Number(m) || 1;
  const years: number[] = [];
  for (let yy = currentYear - 10; yy <= currentYear + 1; yy++) years.push(yy);
  return (
    <div className={`flex gap-1 ${className}`}>
      <Select
        value={String(month)}
        onChange={(e) => onChange(`${year}-${String(e.target.value).padStart(2, "0")}`)}
        className="w-24"
      >
        {MONTH_LABELS.map((lbl, i) => (
          <option key={i + 1} value={i + 1}>{lbl}</option>
        ))}
      </Select>
      <Select
        value={String(year)}
        onChange={(e) => onChange(`${e.target.value}-${String(month).padStart(2, "0")}`)}
        className="w-20"
      >
        {years.map((yy) => (
          <option key={yy} value={yy}>{yy}</option>
        ))}
      </Select>
    </div>
  );
}

export function Badge({ children, tone = "indigo" }: { children: ReactNode; tone?: "indigo" | "red" | "green" | "slate" }) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/40",
    red: "bg-red-500/15 text-red-300 border-red-500/40",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    slate: "bg-slate-500/15 text-slate-300 border-slate-500/40",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
