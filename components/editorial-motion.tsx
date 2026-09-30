"use client";

import { useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 950;
const EXIT_MS = 620;
const FALLBACK_READY_MS = 4200;

type FieldGuidePreloaderProps = {
  ready: boolean;
  onComplete: () => void;
};

export function FieldGuidePreloader({
  ready,
  onComplete,
}: FieldGuidePreloaderProps) {
  const [progress, setProgress] = useState(4);
  const [fallbackReady, setFallbackReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const startedAt = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    startedAt.current = performance.now();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const interval = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 88) return value;
        const step = value < 36 ? 4 : value < 68 ? 2 : 1;
        return Math.min(88, value + step);
      });
    }, 72);

    const fallback = window.setTimeout(() => {
      setProgress(100);
      setFallbackReady(true);
    }, FALLBACK_READY_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fallback);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if ((!ready && !fallbackReady) || completedRef.current) return;

    const elapsed = performance.now() - startedAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    let exitTimer = 0;
    let completeTimer = 0;

    const readyTimer = window.setTimeout(() => {
      setProgress(100);

      exitTimer = window.setTimeout(() => {
        setExiting(true);

        completeTimer = window.setTimeout(() => {
          completedRef.current = true;
          setMounted(false);
          document.body.style.overflow = "";
          onComplete();
        }, EXIT_MS);
      }, 170);
    }, wait);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [ready, fallbackReady, onComplete]);

  if (!mounted) return null;

  return (
    <div
      className={`field-loader ${exiting ? "is-exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Preparing the live field guide"
    >
      <div className="field-loader__topline">
        <span>THE INTERNET FIELD GUIDE</span>
        <span>VOL. I · DIGITAL FAUNA</span>
      </div>

      <div className="field-loader__stage" aria-hidden="true">
        <span className="field-loader__registration field-loader__registration--a">+</span>
        <span className="field-loader__registration field-loader__registration--b">+</span>
        <span className="field-loader__registration field-loader__registration--c">+</span>
        <span className="field-loader__registration field-loader__registration--d">+</span>

        <div className="field-loader__specimen">
          <i className="field-loader__wing field-loader__wing--left" />
          <i className="field-loader__wing field-loader__wing--right" />
          <i className="field-loader__body" />
          <i className="field-loader__scan" />
        </div>
      </div>

      <div className="field-loader__footer">
        <div>
          <span>PREPARING LIVE PLATE 00</span>
          <strong>{String(progress).padStart(3, "0")}%</strong>
        </div>
        <div className="field-loader__track" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
        <p>{progress < 100 ? "registering paper · ink · specimen behaviour" : "field plate ready"}</p>
      </div>
    </div>
  );
}

export function useEditorialReveals(enabled: boolean, refreshKey = 0) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    root.classList.add("tifg-motion");

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".field-preface, .section-heading, .specimen-card, .quiet-zone-v2, .secret-section, .journal-heading, .journal-grid, footer",
      ),
    );

    targets.forEach((element) => {
      element.dataset.reveal = "editorial";
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      targets.forEach((element) => element.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -9% 0px",
      },
    );

    targets.forEach((element) => {
      if (!element.classList.contains("is-revealed")) observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [enabled, refreshKey]);
}
