"use client";

import { useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 1600;
const EXIT_MS = 520;
const FALLBACK_READY_MS = 3600;
const REVEAL_SELECTOR =
  ".field-preface, .section-heading, .specimen-card, .quiet-zone-v2, .secret-section, .journal-heading, .journal-grid, footer";

type FieldGuidePreloaderProps = {
  ready: boolean;
  onComplete: () => void;
};

export function FieldGuidePreloader({
  ready,
  onComplete,
}: FieldGuidePreloaderProps) {
  const [progress, setProgress] = useState(6);
  const [fallbackReady, setFallbackReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const startedAt = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!mounted) return;

    startedAt.current = performance.now();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const interval = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 90) return value;
        const step = value < 42 ? 3 : value < 72 ? 2 : 1;
        return Math.min(90, value + step);
      });
    }, 86);

    const fallback = window.setTimeout(() => {
      setProgress(100);
      setFallbackReady(true);
    }, FALLBACK_READY_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fallback);
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

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
      }, 120);
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
      className={`field-loader field-loader--script ${exiting ? "is-exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Opening The Internet Field Guide"
    >
      <div className="field-loader__topline">
        <span>VOL. I · DIGITAL FAUNA</span>
        <span>FIELD NOTES / 2026</span>
      </div>

      <div className="field-loader__script-stage">
        <svg
          className="field-loader__botanical"
          viewBox="0 0 180 120"
          aria-hidden="true"
        >
          <path d="M18 103 C46 82 72 60 104 20" />
          <path d="M47 80 C34 61 25 48 20 35" />
          <path d="M61 69 C46 54 41 41 39 27" />
          <path d="M76 56 C66 41 64 28 66 15" />
          <path d="M91 41 C106 43 121 38 135 27" />
          <path d="M78 55 C95 61 111 62 128 55" />
          <path d="M59 71 C75 82 91 87 111 86" />
          <circle cx="19" cy="34" r="3" />
          <circle cx="38" cy="26" r="3" />
          <circle cx="66" cy="14" r="3" />
          <circle cx="136" cy="26" r="3" />
          <circle cx="129" cy="55" r="3" />
          <circle cx="112" cy="86" r="3" />
        </svg>

        <div className="field-loader__script-wrap" aria-hidden="true">
          <span className="field-loader__script-ghost">The Internet Field Guide</span>
          <span className="field-loader__script-ink">The Internet Field Guide</span>
          <i className="field-loader__pen-nib" />
        </div>

        <p className="field-loader__script-subtitle">
          notes on strange creatures found between tabs
        </p>
      </div>

      <div className="field-loader__footer">
        <div>
          <span>{progress < 100 ? "PREPARING LIVE FIELD PLATES" : "FIELD GUIDE READY"}</span>
          <strong>{String(progress).padStart(3, "0")}%</strong>
        </div>
        <div className="field-loader__track" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export function useEditorialReveals(enabled: boolean, refreshKey = 0) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    root.classList.add("tifg-motion");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveal = (element: HTMLElement) => {
      if (element.dataset.motionPlayed === "1") return;
      element.dataset.motionPlayed = "1";
      element.classList.add("is-revealed");
    };

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    );

    targets.forEach((element) => {
      element.dataset.reveal = "editorial";
    });

    if (reduced) {
      targets.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -4% 0px",
      },
    );

    targets.forEach((element) => {
      if (element.dataset.motionPlayed === "1") return;

      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
        reveal(element);
      } else {
        observer.observe(element);
      }
    });

    const revealHashDestination = () => {
      if (!window.location.hash) return;

      let target: Element | null = null;
      try {
        target = document.querySelector(window.location.hash);
      } catch {
        return;
      }
      if (!target) return;

      const scoped = Array.from(
        target.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
      );

      if (target instanceof HTMLElement && target.matches(REVEAL_SELECTOR)) {
        scoped.unshift(target);
      }

      // Reveal only the heading/first content immediately. Everything after it
      // can still animate normally as the visitor continues scrolling.
      scoped.slice(0, 2).forEach(reveal);
    };

    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      window.setTimeout(revealHashDestination, 80);
    };

    window.addEventListener("hashchange", revealHashDestination);
    document.addEventListener("click", onAnchorClick, true);

    // Fail-open watchdog: if an observer edge case ever occurs, anything that
    // is actually on screen is made visible/animated rather than staying blank.
    const watchdog = window.setInterval(() => {
      targets.forEach((element) => {
        if (element.dataset.motionPlayed === "1") return;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.05 && rect.bottom > -40) {
          reveal(element);
          observer.unobserve(element);
        }
      });
    }, 420);

    return () => {
      observer.disconnect();
      window.clearInterval(watchdog);
      window.removeEventListener("hashchange", revealHashDestination);
      document.removeEventListener("click", onAnchorClick, true);
    };
  }, [enabled, refreshKey]);
}
