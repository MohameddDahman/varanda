"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion, whenNear } from "@/lib/gsap";
import { onPageEnter } from "@/components/transition/store";

type Props = {
  as?: TagName;
  children: React.ReactNode;
  className?: string;
  /** Animate these descendants (staggered) instead of the wrapper itself. */
  items?: string;
  y?: number;
  delay?: number;
  stagger?: number;
  trigger?: "scroll" | "enter";
};

/** Fade-and-rise for blocks; staggered across `items` when given. */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  items,
  y = 36,
  delay = 0,
  stagger = 0.08,
  trigger = "scroll",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const targets = items ? gsap.utils.toArray<HTMLElement>(items, el) : [el];
      if (!targets.length) return;
      const vars = { y, autoAlpha: 0, duration: 1.2, ease: "soft", stagger, delay };
      if (trigger === "enter") {
        const tween = gsap.from(targets, { ...vars, paused: true });
        return onPageEnter(() => tween.play());
      }
      // Set up only as it nears the viewport (see whenNear).
      const setup = () => {
        gsap.from(targets, { ...vars, scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } });
      };
      return whenNear(el, contextSafe ? contextSafe(setup) : setup);
    },
    { scope: ref },
  );

  const El = Tag as unknown as Polymorphic;
  return (
    <El ref={ref} className={className}>
      {children}
    </El>
  );
}

/** Tag names accepted by `as`, and the props we pass through them. */
export type TagName = keyof React.JSX.IntrinsicElements;
export type Polymorphic = React.ComponentType<
  React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement>; id?: string }
>;
