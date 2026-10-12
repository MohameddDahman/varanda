"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { L } from "@/i18n/config";
import { useTransitionNav } from "./TransitionProvider";

type Props = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & {
  href: string;
  /** Override the name printed on the doors (defaults to the route's name). */
  label?: L;
};

/**
 * next/link that plays the door transition. `onNavigate` only fires for
 * same-origin client navigations without modifier keys, so new-tab clicks,
 * downloads and external links behave natively.
 */
export function TLink({ href, label, ...props }: Props) {
  const { navigate } = useTransitionNav();
  return (
    <Link
      href={href}
      {...props}
      onNavigate={(e) => {
        e.preventDefault();
        navigate(href, label);
      }}
    />
  );
}
