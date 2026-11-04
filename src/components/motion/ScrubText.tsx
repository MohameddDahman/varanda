"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, reducedMotion, splitAria, whenNear } from "@/lib/gsap";
import type { Polymorphic, TagName } from "./Reveal";

/** A statement that "reads itself": words brighten one by one as you scroll past. */
export function ScrubText({
  as: Tag = "p",
  children,
  className,
}: {
  as?: TagName;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      let split: SplitText | undefined;
      // Split into words only as it nears the viewport (see whenNear).
      const setup = () => {
        split = SplitText.create(el, {
          type: "words",
          aria: splitAria(el),
          autoSplit: true,
          onSplit(self) {
            return gsap.fromTo(
              self.words,
              { opacity: 0.16 },
              {
                opacity: 1,
                ease: "none",
                stagger: 0.1,
                scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: true },
              },
            );
          },
        });
      };
      const stop = whenNear(el, contextSafe ? contextSafe(setup) : setup);
      return () => {
        stop();
        split?.revert();
      };
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
