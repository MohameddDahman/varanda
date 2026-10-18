import { Montserrat, Tajawal } from "next/font/google";

// The company profile's typefaces: Montserrat for English (headings, text and the
// letter-spaced labels), Tajawal for Arabic. Shared by the site and the admin layouts.
export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// Only the Arabic files are preloaded (about 9KB a weight). Without them Arabic text first renders
// in the fallback font, which runs narrower, and pages jump as Tajawal swaps in. Tajawal's Latin
// letters still load on demand.
export const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});
