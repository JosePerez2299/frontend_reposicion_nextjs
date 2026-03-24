import { cn } from "@/lib/utils";

export function Checkbox({
  checked,
  indeterminate = false,
}: {
  checked: boolean;
  indeterminate?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-4 h-4 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors",
        checked || indeterminate
          ? "bg-primary border-primary"
          : "border-border bg-background",
      )}
    >
      {indeterminate && !checked && (
        <div className="w-2 h-[1.5px] bg-primary-foreground rounded-full" />
      )}
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path
            d="M1 3.5L3.5 6L8 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
