import type { Metadata, Viewport } from "next";
import "./admin.css";

import { dirOf } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { montserrat, tajawal } from "@/lib/fonts";
import { getAdminLang } from "@/lib/admin/server";
import { AdminLangProvider } from "@/components/admin/AdminLang";
import { Toaster } from "@/components/admin/Toaster";

export const metadata: Metadata = {
  title: { default: "VARANDA admin", template: "%s — VARANDA admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#081a2f",
  width: "device-width",
  initialScale: 1,
  // Lets the tab bar sit clear of the iPhone home indicator.
  viewportFit: "cover",
};

/** The dashboard's own root layout: none of the site's header, transitions or smooth scroll. */
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getAdminLang();
  return (
    <html lang={lang} dir={dirOf(lang)} className={cn(montserrat.variable, tajawal.variable)}>
      <body>
        <AdminLangProvider lang={lang}>
          <Toaster>{children}</Toaster>
        </AdminLangProvider>
      </body>
    </html>
  );
}
