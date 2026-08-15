import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Badge({
  children,
  className
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return <div className={cn("rounded-[1.6rem] border border-black/5 bg-white shadow-soft", className)}>{children}</div>;
}
