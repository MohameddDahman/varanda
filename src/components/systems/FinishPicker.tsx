"use client";

import Image from "next/image";
import { useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { finishes } from "@/content/systems";
import { photos } from "@/content/photos";
import { OpeningDrawing } from "./OpeningDrawing";
import { cn } from "@/lib/cn";

/** Pick a frame colour and see it on a working window. Wood uses the real foil photo. */
export function FinishPicker() {
  const { t, lang } = useLang();
  const [active, setActive] = useState("white");
  const finish = finishes.find((f) => f.id === active)!;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-x-8">
      <div className="lg:col-span-5">
        <div className="mx-auto max-w-[24rem] lg:mx-0">
          <OpeningDrawing kind="tilt-turn" mode="loop" frame={finish.color} />
        </div>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        <div role="radiogroup" aria-label={lang === "ar" ? "لون الإطار" : "Frame colour"} className="grid grid-cols-5 gap-3">
          {finishes.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={active === f.id}
              onClick={() => setActive(f.id)}
              className="group text-start"
            >
              <span
                className={cn(
                  "finish-swatch relative block aspect-square overflow-hidden",
                  active === f.id && "is-active",
                )}
                style={{ background: f.color }}
              >
                {/* Swatches reach about 135px on tablets, and the grain is drawn at twice that. */}
                {f.texture === "wood" && (
                  <Image src={photos.woodgrain.src} alt="" fill sizes="300px" className="rotate-90 scale-[2] object-cover" />
                )}
              </span>
              <span className="t-small mt-3 block">{t(f.name)}</span>
            </button>
          ))}
        </div>
        <p className="t-body mt-10 max-w-[46ch] text-[var(--fg-2)]">
          {lang === "ar"
            ? "تشكيلة من الألوان والتشطيبات للإطارات والضلف، تُطابق مع ألوان المقابض والشاتر لتناسب مختلف الطرز المعمارية."
            : "Frames and sashes come in a range of colours and finishes, matched by handles and shutters, to suit different architectural styles."}
        </p>
        {finish.texture === "wood" && (
          <p className="t-label mt-4 text-[var(--fg-2)]">
            {lang === "ar" ? "تشطيب بلون الخشب — صورة حقيقية للقطاع" : "Wood finish — a real profile sample"}
          </p>
        )}
      </div>
    </div>
  );
}
