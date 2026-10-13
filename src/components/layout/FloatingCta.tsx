"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ui } from "@/content/site";
import { useLang } from "@/components/providers/LangProvider";
import { TLink } from "@/components/transition/TLink";

/** "Book a site visit" for phones: appears after the first screen, never on the contact page. */
export function FloatingCta() {
  const { t, href } = useLang();
  const pathname = usePathname();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const update = () => setShown(window.scrollY > window.innerHeight * 0.8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (pathname.endsWith("/contact")) return null;
  return (
    <TLink href={href("/contact")} className="btn cta-float" data-hidden={!shown} tabIndex={shown ? undefined : -1} aria-hidden={!shown}>
      {t(ui.bookVisit)}
    </TLink>
  );
}
