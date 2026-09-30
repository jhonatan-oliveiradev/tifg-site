"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AniDoodlePiece } from "@/components/anidoodle-piece";
import { heroPiece } from "@/art/pieces/hero";
import { createSpecimenPiece, type SpecimenKind } from "@/art/pieces/specimens";

const STORAGE_KEY = "tifg:discovered:v1";
const QUIET_SECONDS = 7;

type Specimen = {
  id: string;
  number: string;
  title: string;
  scientific: string;
  epitaph: string;
  habitat: string;
  behaviour: string;
  activity: string;
  threat: number;
  note: string;
  kind: SpecimenKind;
  seed: number;
  marginNote: string;
};

const specimens: Specimen[] = [
  {
    id: "infinite-scroller",
    number: "001",
    title: "The Infinite Scroller",
    scientific: "Volutus infinitum",
    epitaph: "Feeds indefinitely. Sleeps never.",
    habitat: "Social feeds · short video apps",
    behaviour: "Consumes one more post forever",
    activity: "Peak after midnight",
    threat: 3,
    note: "The tail is always one post farther away than expected. It becomes noticeably more alert when the observer approaches its feed.",
    kind: "scroller",
    seed: 1103,
    marginNote: "approach a post slowly →",
  },
  {
    id: "notification-goblin",
    number: "002",
    title: "The Notification Goblin",
    scientific: "Badgia compulsiva",
    epitaph: "Feeds on unread badges.",
    habitat: "Dock icons · inboxes · lock screens",
    behaviour: "Collects, guards and multiplies alerts",
    activity: "Every 4–7 minutes",
    threat: 2,
    note: "Do not make eye contact with the red circle. The specimen interprets attention as both food and competition.",
    kind: "goblin",
    seed: 2207,
    marginNote: "protective around 99+",
  },
  {
    id: "the-algorithm",
    number: "003",
    title: "The Algorithm",
    scientific: "Machina obscura",
    epitaph: "Nobody has seen the whole creature.",
    habitat: "Recommendations · rankings · for-you pages",
    behaviour: "Rearranges itself around the observer",
    activity: "Continuous",
    threat: 4,
    note: "Specimens disagree on its actual shape. Each observer appears to receive a different animal, and the animal appears to receive a different observer.",
    kind: "algorithm",
    seed: 3301,
    marginNote: "it notices what you almost touch",
  },
];

const lurker: Specimen = {
  id: "the-lurker",
  number: "004",
  title: "The Lurker",
  scientific: "Spectator tacitus",
  epitaph: "Has been here the whole time.",
  habitat: "Forums · chats · comment sections",
  behaviour: "Reads everything. Posts nothing.",
  activity: "Only when unobserved",
  threat: 1,
  note: "This specimen appeared only after the observer stopped trying to find it. When noticed, it attempted to hide behind its own field sketch.",
  kind: "lurker",
  seed: 4409,
  marginNote: "avoid sudden cursor movements",
};

const pieces = Object.fromEntries(
  [...specimens, lurker].map((specimen) => [
    specimen.id,
    createSpecimenPiece(
      specimen.kind,
      specimen.title,
      `Hand-drawn field sketch of ${specimen.title}`,
      specimen.seed,
    ),
  ]),
);

function ThreatDots({ level }: { level: number }) {
  return (
    <span className="threat-dots" aria-label={`Threat level ${level} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < level ? "filled" : undefined}>●</span>
      ))}
    </span>
  );
}

function SpecimenCard({
  specimen,
  observed,
  onObserve,
  secret = false,
  index,
}: {
  specimen: Specimen;
  observed: boolean;
  onObserve: (id: string) => void;
  secret?: boolean;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleObserve = () => {
    onObserve(specimen.id);
    setExpanded((value) => !value);
  };

  return (
    <article
      className={`specimen-card specimen-card--v2 specimen-card--${index + 1} ${observed ? "is-observed" : ""} ${secret ? "is-secret" : ""}`}
      data-specimen-root
    >
      <div className="specimen-card__header">
        <div>
          <span className="specimen-number">SPECIMEN {specimen.number}</span>
          <h2>{specimen.title}</h2>
          <p className="scientific-name">{specimen.scientific}</p>
        </div>
        <span className="catalogue-mark" aria-hidden="true">{observed ? "LOGGED" : "UNFILED"}</span>
      </div>

      <div className="specimen-art-wrap specimen-art-wrap--v2">
        <div className="plate-corners" aria-hidden="true"><i /><i /><i /><i /></div>
        <AniDoodlePiece
          piece={pieces[specimen.id]}
          state={observed ? "observed" : "idle"}
          className="specimen-art"
          label={`Live field sketch of ${specimen.title}`}
        />
        <span className="sketch-note sketch-note--left" aria-hidden="true">{specimen.marginNote}</span>
        <span className="sketch-note sketch-note--right" aria-hidden="true">live / pointer-aware</span>
      </div>

      <p className="epitaph">{specimen.epitaph}</p>

      <div className="specimen-facts">
        <div><span>Habitat</span><strong>{specimen.habitat}</strong></div>
        <div><span>Behaviour</span><strong>{specimen.behaviour}</strong></div>
        <div><span>Activity</span><strong>{specimen.activity}</strong></div>
        <div><span>Threat</span><ThreatDots level={specimen.threat} /></div>
      </div>

      <button
        type="button"
        className="observe-button"
        onClick={handleObserve}
        data-anidoodle={`observe-${specimen.id}`}
        aria-expanded={expanded}
      >
        <span>{observed ? "Reopen field note" : "Observe specimen"}</span>
        <span aria-hidden="true">{expanded ? "×" : "↗"}</span>
      </button>

      <div className="field-note" data-open={expanded}>
        <span className="field-note__label">FIELD NOTE / OBSERVER 01</span>
        <p>{specimen.note}</p>
        <span className="field-note__signature">logged locally on this device</span>
      </div>
    </article>
  );
}

export function FieldGuide() {
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [quietVisible, setQuietVisible] = useState(false);
  const [quietElapsed, setQuietElapsed] = useState(0);
  const [secretVisible, setSecretVisible] = useState(false);
  const [secretAnnouncement, setSecretAnnouncement] = useState("");
  const quietRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) {
        const ids = stored.filter((id): id is string => typeof id === "string");
        setDiscovered(ids);
        if (ids.includes(lurker.id)) setSecretVisible(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const node = quietRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setQuietVisible(entry.isIntersecting && entry.intersectionRatio > 0.42),
      { threshold: [0, 0.42, 0.7] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!quietVisible || secretVisible) {
      if (!secretVisible) setQuietElapsed(0);
      return;
    }

    let started = performance.now();
    let interval = window.setInterval(() => {
      const next = Math.min(QUIET_SECONDS, (performance.now() - started) / 1000);
      setQuietElapsed(next);
      if (next >= QUIET_SECONDS) {
        window.clearInterval(interval);
        setSecretVisible(true);
        setSecretAnnouncement("A hidden specimen has stepped out of the margin: The Lurker.");
      }
    }, 100);

    const reset = () => {
      started = performance.now();
      setQuietElapsed(0);
    };

    const events: Array<keyof WindowEventMap> = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));

    return () => {
      window.clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [quietVisible, secretVisible]);

  const observed = useMemo(() => new Set(discovered), [discovered]);

  const observe = (id: string) => {
    setDiscovered((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const progress = observed.size;
  const total = 4;
  const quietRatio = quietElapsed / QUIET_SECONDS;
  const quietStage =
    quietRatio < 0.18 ? "Listening…" :
    quietRatio < 0.42 ? "Something moved in the margin." :
    quietRatio < 0.7 ? "Two eyes. Do not move." :
    quietRatio < 0.98 ? "It thinks you cannot see it." :
    "Sighting confirmed.";

  return (
    <main id="field-guide">
      <p className="sr-only" aria-live="polite">{secretAnnouncement}</p>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="The Internet Field Guide, back to top">
          <span className="brand__seal" aria-hidden="true">IF</span>
          <span><strong>The Internet</strong><em>Field Guide</em></span>
        </a>
        <nav aria-label="Field guide navigation">
          <a href="#specimens">Specimens</a>
          <a href="#quiet-zone">Quiet zone</a>
          <a href="#journal">Journal</a>
          <span className="journal-count">{String(progress).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
        </nav>
      </header>

      <section className="hero-story" id="top" data-specimen-root>
        <div className="hero hero--v2">
          <div className="hero-copy">
            <div className="eyebrow-row"><span>VOL. I · DIGITAL FAUNA</span><span>EST. 2026</span></div>
            <h1>Strange creatures live <span>between your tabs.</span></h1>
            <p className="hero-intro">
              A living field guide to the habits, habitats and questionable survival strategies of the things we meet every day on the internet.
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#specimens" data-anidoodle="begin-expedition">Begin expedition <span aria-hidden="true">↓</span></a>
              <span className="hero-instruction">The plate draws itself. Then it notices you.</span>
            </div>
            <div className="hero-process" aria-hidden="true">
              <span>01 construction</span><span>02 pencil</span><span>03 wash</span><span>04 ink</span><span>05 awake</span>
            </div>
          </div>

          <div className="hero-plate hero-plate--v2">
            <div className="plate-label plate-label--top"><span>PLATE 01 · LIVE STUDY</span><span>DRAWN IN CODE</span></div>
            <AniDoodlePiece
              piece={heroPiece}
              state={observed.has("infinite-scroller") ? "observed" : "idle"}
              className="hero-art hero-art--v2"
              label="A field plate drawing itself, becoming a living creature, then following the pointer"
              scrollTrack="#top"
            />
            <div className="plate-caption">
              <span>FIG. A</span>
              <p>Construction, pigment and ink are all rebuilt by the same source. Move the pointer after the eyes open.</p>
            </div>
          </div>
          <span className="hero-margin-note" aria-hidden="true">watch the eyes after the ink dries →</span>
        </div>
      </section>

      <section className="field-preface field-preface--v2">
        <span className="section-index">FIELD NOTE 00</span>
        <p>The browser is not empty space. It is an ecosystem that learned to watch back.</p>
        <aside><strong>Observation protocol</strong>Hover, approach, click and linger. The sketches change their behaviour when they know they are being studied.</aside>
      </section>

      <section className="specimens-section" id="specimens">
        <div className="section-heading">
          <div><span className="section-index">CATALOGUE · 01—03</span><h2>Common sightings</h2></div>
          <p>Each plate is a live AniDoodle specimen. There is no sprite sheet or video hiding underneath it.</p>
        </div>

        <div className="specimen-list specimen-list--v2">
          {specimens.map((specimen, index) => (
            <SpecimenCard
              key={specimen.id}
              specimen={specimen}
              observed={observed.has(specimen.id)}
              onObserve={observe}
              index={index}
            />
          ))}
        </div>
      </section>

      <section
        className={`quiet-zone quiet-zone--v2 ${quietVisible ? "is-listening" : ""} ${secretVisible ? "is-complete" : ""}`}
        id="quiet-zone"
        ref={quietRef}
        style={{ "--quiet-progress": quietRatio } as React.CSSProperties}
      >
        <div className="quiet-zone__copy">
          <span className="section-index">OBSERVATION SITE 04</span>
          <h2>Stop looking for it.</h2>
          <p>Remain inside this page. Do not move the pointer. The undocumented specimen is unusually sensitive to attention.</p>
          <div className="quiet-readout" aria-live="polite">
            <strong>{secretVisible ? "SIGHTING CONFIRMED" : quietStage}</strong>
            <span>{secretVisible ? "04 / LOG READY" : `${quietElapsed.toFixed(1)} / ${QUIET_SECONDS}.0 SEC`}</span>
          </div>
        </div>

        <div className="quiet-observation" aria-hidden="true">
          <div className="quiet-frame">
            <span className="quiet-eye quiet-eye--a">•</span>
            <span className="quiet-eye quiet-eye--b">•</span>
            <i className="quiet-shadow" />
            <div className="quiet-crosshair quiet-crosshair--1">+</div>
            <div className="quiet-crosshair quiet-crosshair--2">+</div>
            <div className="quiet-crosshair quiet-crosshair--3">+</div>
          </div>
          <div className="quiet-progress"><i /></div>
          <span className="quiet-instruction">{quietVisible ? "keep still" : "enter observation area"}</span>
        </div>
      </section>

      {secretVisible && (
        <section className="secret-section secret-section--v2" aria-label="Hidden specimen discovered">
          <div className="secret-ribbon"><span>UNEXPECTED SIGHTING</span><span>SPECIMEN 004</span><span>KEEP YOUR VOICE DOWN</span></div>
          <SpecimenCard
            specimen={lurker}
            observed={observed.has(lurker.id)}
            onObserve={observe}
            secret
            index={3}
          />
        </section>
      )}

      <section className="journal" id="journal">
        <div className="journal-heading">
          <span className="section-index">YOUR FIELD JOURNAL</span>
          <h2>{String(progress).padStart(2, "0")} / {String(total).padStart(2, "0")} specimens logged</h2>
          <p>The journal stays on this device. No account, no cloud sync, no zoological mailing list.</p>
        </div>

        <div className="journal-grid">
          {[...specimens, lurker].map((specimen) => {
            const isObserved = observed.has(specimen.id);
            return (
              <div className={`journal-stamp ${isObserved ? "is-found" : ""}`} key={specimen.id}>
                <span>{isObserved ? specimen.number : "—"}</span>
                <strong>{isObserved ? specimen.title : "Undocumented"}</strong>
                <em>{isObserved ? "OBSERVED" : "NOT YET LOGGED"}</em>
              </div>
            );
          })}
        </div>
      </section>

      <footer>
        <div><strong>The Internet Field Guide</strong><span>Vol. I · Digital Fauna</span></div>
        <p>Every creature on this page is drawn and animated in code with AniDoodle.</p>
        <a href="https://github.com/alexgreensh/anidoodle" target="_blank" rel="noreferrer">Study the drawing engine ↗</a>
      </footer>
    </main>
  );
}
