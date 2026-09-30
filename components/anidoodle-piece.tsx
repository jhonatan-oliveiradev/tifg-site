"use client";

import { useEffect, useRef } from "react";

type AniController = {
  destroy(): void;
  setState(name: string): void;
};

type AniDoodlePieceProps = {
  piece: unknown;
  state?: string;
  className?: string;
  label?: string;
  scrollTrack?: string;
};

export function AniDoodlePiece({
  piece,
  state = "idle",
  className,
  label,
  scrollTrack,
}: AniDoodlePieceProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AniController | null>(null);

  useEffect(() => {
    let disposed = false;

    async function boot() {
      const host = hostRef.current;
      if (!host) return;

      const { mount } = await import(
        "../.anidoodle/repo/skills/anidoodle/engine/src/hosts/interactive"
      );

      if (disposed || !hostRef.current) return;

      const root = host.closest("[data-specimen-root]") ?? host.parentElement ?? undefined;
      const controller = mount(
        host,
        piece as Parameters<typeof mount>[1],
        {
          root,
          scrollTrack,
          state,
          pauseControl: true,
          maxScale: 2,
          reducedMotion: "auto",
        },
      );

      controllerRef.current = controller;
    }

    void boot();

    return () => {
      disposed = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [piece, scrollTrack]);

  useEffect(() => {
    controllerRef.current?.setState(state);
  }, [state]);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-label={label}
      data-anidoodle-host
    />
  );
}
