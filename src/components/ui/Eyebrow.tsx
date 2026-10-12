import { cn } from "@/lib/cn";

/** Section label with the brand's red slash ("/ Opening systems"), as in the profile. */
export function Eyebrow({
  children,
  className,
  as: Tag = "p",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  /** Use "h2" when the label is the only heading a section has. */
  as?: "p" | "h2";
  id?: string;
}) {
  return (
    <Tag id={id} className={cn("t-label flex items-center gap-2 text-[var(--fg-2)]", className)}>
      <span className="text-red" aria-hidden="true">
        /
      </span>
      <span>{children}</span>
    </Tag>
  );
}
