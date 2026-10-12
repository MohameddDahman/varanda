"use client";

import { useRef } from "react";
import { gsap, reducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { TLink } from "@/components/transition/TLink";

type Common = {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "light";
  size?: "md" | "lg";
  className?: string;
  arrow?: boolean;
  magnetic?: boolean;
};

type AsLink = Common & { href: string; external?: boolean; type?: never; onClick?: never; disabled?: never };
type AsButton = Common & {
  href?: never;
  external?: never;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 12" className={cn("h-3 w-6 shrink-0 rtl:-scale-x-100", className)} aria-hidden="true">
      <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Square-cornered button; the fill slides in from the leading edge like a sash. */
export function Button(props: AsLink | AsButton) {
  const { children, variant = "solid", size = "md", className, arrow = true, magnetic = true } = props;
  const el = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (!magnetic || e.pointerType !== "mouse" || reducedMotion() || !el.current) return;
    const r = el.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(el.current, { x: x * 0.18, y: y * 0.28, duration: 0.6, ease: "power3" });
    gsap.to(inner.current, { x: x * 0.08, y: y * 0.12, duration: 0.6, ease: "power3" });
  };
  const onLeave = () => {
    if (!el.current) return;
    gsap.to([el.current, inner.current], { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });
  };

  const classes = cn("btn", `btn-${variant}`, size === "lg" && "btn-lg", className);
  const content = (
    <span ref={inner} className="btn-inner">
      <span>{children}</span>
      {arrow && <Arrow className="btn-arrow" />}
    </span>
  );

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          ref={el as React.Ref<HTMLAnchorElement>}
          href={props.href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          {content}
        </a>
      );
    }
    return (
      <TLink
        ref={el as React.Ref<HTMLAnchorElement>}
        href={props.href}
        className={classes}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {content}
      </TLink>
    );
  }

  const b = props as AsButton;
  return (
    <button
      ref={el as React.Ref<HTMLButtonElement>}
      type={b.type ?? "button"}
      onClick={b.onClick}
      disabled={b.disabled}
      className={classes}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {content}
    </button>
  );
}
