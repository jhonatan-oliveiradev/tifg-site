"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AniDoodlePiece } from "@/components/anidoodle-piece";
import { fieldGuideHero } from "@/art/pieces/hero";
import { createSpecimenPiece, type SpecimenKind } from "@/art/pieces/specimens";

const STORAGE_KEY = "tifg:discovered:v1";
const LURKER_SEEN_KEY = "tifg:lurker-seen:v1";

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
  interactionHint: string;
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
    note: "Field observation: the tail is always one post farther away than expected.",
    kind: "scroller",
    seed: 1103,
    interactionHint: "Move toward one of its posts.",
    marginNote: "feeding appendages disguised as content cards",
  },
  {
    id: "notification-goblin",
    number: "002",
    title: "The Notification Goblin",
    scientific: "Badgia compulsiva",
    epitaph: "Feeds on unread badges.",
    habitat: "Dock icons · inboxes · lock screens",
    behaviour: "Protects anything red and numbered",
    activity: "Every 4–7 minutes",
    threat: 2,
    note: "Do not make eye contact with the red circle. It interprets attention as food.",
    kind: "goblin",
    seed: 2207,
    interactionHint: "Approach the 99+ badge slowly.",
    marginNote: "specimen becomes territorial near high-value badges",
  },
  {
    id: "the-algorithm",
    number: "003",
    title: "The Algorithm",
    scientific: "Machina obscura",
    epitaph: "Nobody has seen the whole creature.",
    habitat: "Recommendations · rankings · for-you pages",
    behaviour: "Predicts where attention will move next",
    activity: "Continuous",
    threat: 4,
    note: "Specimens disagree on its actual shape. Each observer appears to receive a different animal.",
    kind: "algorithm",
    seed: 3301,
    interactionHint: "Let it predict where your cursor is going.",
    marginNote: "network topology changes when directly observed",
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
  activity: "Unmeasurable",
  threat: 1,
  note: "This specimen only appeared after the observer stopped trying to find it.",
  kind: "lurker",
  seed: 4409,
  interactionHint: "Once found, move closer and watch it retreat.",
  marginNote: "presence confirmed only after observer inactivity",
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
        <span key={index} className={index < level ? "filled" : undefined}>
          ●
        </span>
      ))}
    </span>
  );
}

function SpecimenCard({
  specimen,
  observed,
  onObserve,
  secret = false,
}: {
  specimen: Specimen;
  observed: boolean;
  onObserve: (id: string) => void;
  secret?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleObserve = () => {
    onObserve(specimen.id);
    setExpanded((value) => !value);
  };

  return (
    <article
      className={`specimen-card specimen-card--${specimen.kind} ${observed ? "is-observed" : ""} ${secret ? "is-secret" : ""}`}
      data-specimen-root
    >
      <div className="specimen-card__header">
        <div>
          <span className="specimen-number">SPECIMEN {specimen.number}</span>
          <h2>{specimen.title}</h2>
          <p className="scientific-name">{specimen.scientific}</p>
        </div>
        <span className="catalogue-mark" aria-hidden="true">
          {observed ? "LOGGED" : "UNFILED"}
        </span>
      </div>

      <div className="specimen-art-wrap" data-anidoodle="specimen-art">
        <AniDoodlePiece
          piece={pieces[specimen.id]}
          state={observed ? "observed" : "idle"}
          className="specimen-art"
          label={`Live field sketch of ${specimen.title}`}
        />
        <span className="sketch-note sketch-note--left" aria-hidden="true">
          {specimen.interactionHint}
        </span>
        <span className="sketch-note sketch-note--right" aria-hidden="true">
          {specimen.marginNote}
        </span>
      </div>

      <blockquote className="epitaph">{specimen.epitaph}</blockquote>

      <div className="specimen-facts">
        <div>
          <span>Habitat</span>
          <strong>{specimen.habitat}</strong>
        </div>
        <div>
          <span>Behaviour</span>
          <strong>{specimen.behaviour}</strong>
        </div>
        <div>
          <span>Activity</span>
          <strong>{specimen.activity}</strong>
        </div>
        <div>
          <span>Threat</span>
          <ThreatDots level={specimen.threat} />
        </div>
      </div>

      <button
        type="button"
        className="observe-button"
        onClick={handleObserve}
        data-anidoodle={`observe-${specimen.id}`}
        aria-expanded={expanded}
      >
        <span>{observed ? "Reopen field note" : "Log this specimen"}</span>
        <span aria-hidden="true">↗</span>
      </button>

      <div className="field-note" data-open={expanded}>
        <span className="field-note__label">FIELD NOTE</span>
        <p>{specimen.note}</p>
        <span className="field-note__signature">— observer 01</span>
      </div>
    </article>
  );
}

const quietStates = ["hidden", "trace", "eyes", "form", "revealed"] as const;
const QUIET_DURATION_MS = 7200;
const QUIET_POINTER_TOLERANCE = 28;
const quietCopy = [
  "Enter the blind and stop disturbing the habitat.",
  "Something moved behind the paper grain.",
  "Two reflective points. Do not approach.",
  "Outline forming. Keep still.",
  "Presence confirmed.",
];

export function FieldGuide() {
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [secretVisible, setSecretVisible] = useState(false);
  const [secretAnnouncement, setSecretAnnouncement] = useState("");
  const [quietVisible, setQuietVisible] = useState(false);
  const [quietStage, setQuietStage] = useState(0);
  const [quietRemaining, setQuietRemaining] = useState(QUIET_DURATION_MS / 1000);
  const [quietStatus, setQuietStatus] = useState<"waiting" | "observing" | "reset" | "complete">("waiting");
  const quietRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) {
        setDiscovered(stored.filter((id): id is string => typeof id === "string"));
      }
      if (localStorage.getItem(LURKER_SEEN_KEY) === "1" || stored?.includes?.(lurker.id)) {
        setSecretVisible(true);
        setQuietStage(4);
        setQuietRemaining(0);
        setQuietStatus("complete");
      }
    } catch {
      // The guide remains usable without persistence.
    }
  }, []);

  useEffect(() => {
    const node = quietRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setQuietVisible(entry.isIntersecting && entry.intersectionRatio > 0.42),
      { threshold: [0, 0.42, 0.65] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (secretVisible) {
      setQuietStage(4);
      setQuietRemaining(0);
      setQuietStatus("complete");
      return;
    }

    if (!quietVisible) {
      setQuietStage(0);
      setQuietRemaining(QUIET_DURATION_MS / 1000);
      setQuietStatus("waiting");
      return;
    }

    let startedAt = performance.now();
    let intervalId = 0;
    let statusTimer = 0;
    let completed = false;
    let pointerAnchor: { x: number; y: number } | null = null;
    let scrollAnchor = window.scrollY;

    const stageForElapsed = (elapsed: number) => {
      if (elapsed >= 5100) return 3;
      if (elapsed >= 3200) return 2;
      if (elapsed >= 1400) return 1;
      return 0;
    };

    const finish = () => {
      if (completed) return;
      completed = true;
      window.clearInterval(intervalId);
      window.clearTimeout(statusTimer);
      setQuietStage(4);
      setQuietRemaining(0);
      setQuietStatus("complete");
      setSecretVisible(true);
      setSecretAnnouncement("A hidden specimen has emerged: The Lurker.");
      try {
        localStorage.setItem(LURKER_SEEN_KEY, "1");
      } catch {
        // Persistence is enhancement-only.
      }
    };

    const update = () => {
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, (QUIET_DURATION_MS - elapsed) / 1000);
      setQuietRemaining(remaining);
      setQuietStage(stageForElapsed(elapsed));
      if (elapsed >= QUIET_DURATION_MS) finish();
    };

    const restart = () => {
      if (completed) return;
      startedAt = performance.now();
      setQuietStage(0);
      setQuietRemaining(QUIET_DURATION_MS / 1000);
      setQuietStatus("reset");
      window.clearTimeout(statusTimer);
      statusTimer = window.setTimeout(() => setQuietStatus("observing"), 560);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerAnchor) {
        pointerAnchor = { x: event.clientX, y: event.clientY };
        return;
      }

      const distance = Math.hypot(
        event.clientX - pointerAnchor.x,
        event.clientY - pointerAnchor.y,
      );

      // Trackpad/mouse sensor noise should not make the blind impossible.
      if (distance < QUIET_POINTER_TOLERANCE) return;

      pointerAnchor = { x: event.clientX, y: event.clientY };
      restart();
    };

    const onScroll = () => {
      const distance = Math.abs(window.scrollY - scrollAnchor);
      if (distance < 16) return;
      scrollAnchor = window.scrollY;
      restart();
    };

    const onHardDisturbance = () => restart();

    setQuietStatus("observing");
    update();
    intervalId = window.setInterval(update, 100);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onHardDisturbance, { passive: true });
    window.addEventListener("keydown", onHardDisturbance);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(statusTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onHardDisturbance);
      window.removeEventListener("keydown", onHardDisturbance);
      window.removeEventListener("scroll", onScroll);
    };
  }, [quietVisible, secretVisible]);

  const observed = useMemo(() => new Set(discovered), [discovered]);

  const observe = (id: string) => {
    setDiscovered((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Persistence is enhancement-only.
      }
      return next;
    });
  };

  const progress = observed.size;
  const total = 4;
  const lurkerState = observed.has(lurker.id)
    ? "observed"
    : secretVisible
      ? "revealed"
      : quietStates[quietStage];

  const quietMessage = secretVisible
    ? "The habitat remembers that you found it."
    : quietStatus === "reset"
      ? "Movement detected. The specimen withdrew; observation has restarted."
      : quietCopy[quietStage];

  return (
    <main id="field-guide">
      <p className="sr-only" aria-live="polite">
        {secretAnnouncement}
      </p>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="The Internet Field Guide, back to top">
          <span className="brand__seal" aria-hidden="true">IF</span>
          <span>
            <strong>The Internet</strong>
            <em>Field Guide</em>
          </span>
        </a>

        <nav aria-label="Field guide navigation">
          <a href="#specimens">Specimens</a>
          <a href="#quiet-zone">Field blind</a>
          <a href="#journal">Journal</a>
          <span className="journal-count">{String(progress).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
        </nav>
      </header>

      <section className="hero-story" id="hero-story">
        <div className="hero-stage" id="top" data-specimen-root>
          <div className="hero-copy">
            <div className="eyebrow-row">
              <span>VOL. I · DIGITAL FAUNA</span>
              <span>EST. 2026</span>
            </div>

            <h1>
              Strange creatures live
              <span>between your tabs.</span>
            </h1>

            <p className="hero-intro">
              A field guide to the habits, habitats and questionable survival strategies of the
              things we meet every day on the internet.
            </p>

            <div className="hero-actions">
              <a className="primary-link" href="#specimens" data-anidoodle="begin-expedition">
                Begin expedition <span aria-hidden="true">↓</span>
              </a>
              <span className="hero-instruction">
                Scroll slowly. You are holding the illustrator&apos;s hand.
              </span>
            </div>

            <ol className="hero-process" aria-label="Illustration stages">
              <li><span>01</span> construction</li>
              <li><span>02</span> pencil</li>
              <li><span>03</span> watercolour</li>
              <li><span>04</span> final line</li>
              <li><span>05</span> alive</li>
            </ol>
          </div>

          <div className="hero-plate" data-anidoodle="hero-plate">
            <div className="plate-label plate-label--top">
              PLATE 00 · INTERTAB LEPIDOPTERA · LIVE STUDY
            </div>
            <AniDoodlePiece
              piece={fieldGuideHero}
              state="observed"
              scrollTrack="#hero-story"
              className="hero-art"
              label="The Intertab Moth being drawn into life as the page scrolls"
            />
            <div className="plate-caption">
              <span>FIG. A</span>
              <p>
                Construction marks remain visible by design. After the final line dries, the
                specimen begins tracking the observer.
              </p>
            </div>
            <span className="plate-coordinate plate-coordinate--a">cursor-sensitive ocular pair</span>
            <span className="plate-coordinate plate-coordinate--b">browser-tab mimicry</span>
          </div>

          <span className="hero-margin-note" aria-hidden="true">
            drawing process is the interface →
          </span>
        </div>
      </section>

      <section className="field-preface">
        <span className="section-index">FIELD NOTE 00</span>
        <p>
          The modern browser is a surprisingly rich ecosystem. Most organisms are harmless.
          Several are annoying. A few have learned to optimize for your attention.
        </p>
        <aside>
          <strong>Observation protocol</strong>
          Hover, click, linger and occasionally do absolutely nothing. The plates record how each
          species responds.
        </aside>
      </section>

      <section className="specimens-section" id="specimens">
        <div className="section-heading">
          <div>
            <span className="section-index">CATALOGUE · 01—03</span>
            <h2>Common sightings</h2>
          </div>
          <p>
            These plates are alive. Each specimen has a different reflex; move across the
            illustration rather than just reading around it.
          </p>
        </div>

        <div className="specimen-list">
          {specimens.map((specimen) => (
            <SpecimenCard
              key={specimen.id}
              specimen={specimen}
              observed={observed.has(specimen.id)}
              onObserve={observe}
            />
          ))}
        </div>
      </section>

      <section
        className={`quiet-zone-v2 ${quietStatus === "reset" ? "is-disturbed" : ""}`}
        id="quiet-zone"
        ref={quietRef}
        data-specimen-root
      >
        <div className="quiet-zone__copy">
          <span className="section-index">FIELD BLIND · RESTRICTED OBSERVATION</span>
          <h2>Some things appear only when you stop looking for them.</h2>
          <p>{quietMessage}</p>

          <div className="quiet-meter" aria-label="Observation progress">
            {quietCopy.map((_, index) => (
              <span key={index} className={index <= quietStage ? "is-active" : undefined} />
            ))}
          </div>

          <div className="quiet-rules">
            <span>NO SCROLL</span>
            <span>MICRO MOVEMENT OK</span>
            <span>NO KEYS</span>
            <strong>{secretVisible ? "PRESENCE RECORDED" : `POINTER TOLERANCE · ${QUIET_POINTER_TOLERANCE} PX`}</strong>
          </div>

          <div className="quiet-status" data-state={quietStatus} aria-live="polite">
            <span>
              {secretVisible
                ? "Observation complete"
                : quietStatus === "reset"
                  ? "Movement detected · timer reset"
                  : quietStatus === "waiting"
                    ? "Enter the observation area"
                    : "Holding observation…"}
            </span>
            <strong>{secretVisible ? "LOCKED" : `${quietRemaining.toFixed(1)} SEC`}</strong>
          </div>
        </div>

        <div className="quiet-observation-window">
          <span className="quiet-window__label">LOW-LIGHT PLATE · UNCLASSIFIED</span>
          <AniDoodlePiece
            piece={pieces[lurker.id]}
            state={lurkerState}
            className="quiet-art"
            label="A hidden creature gradually revealing itself while the observer remains still"
          />
          <div className="quiet-sighting-lines" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      {secretVisible && (
        <section className="secret-section" aria-label="Hidden specimen discovered">
          <div className="secret-ribbon">
            <span>UNEXPECTED SIGHTING · SPECIMEN 004</span>
            <span>PRESENCE CONFIRMED</span>
            <span>DO NOT STARTLE</span>
          </div>
          <SpecimenCard
            specimen={lurker}
            observed={observed.has(lurker.id)}
            onObserve={observe}
            secret
          />
        </section>
      )}

      <section className="journal" id="journal">
        <div className="journal-heading">
          <span className="section-index">YOUR FIELD JOURNAL</span>
          <h2>{String(progress).padStart(2, "0")} / {String(total).padStart(2, "0")} specimens logged</h2>
          <p>
            The journal stays on this device. No account, no cloud sync, no zoological mailing list.
          </p>
        </div>

        <div className="journal-grid">
          {[...specimens, lurker].map((specimen) => {
            const isObserved = observed.has(specimen.id);
            const visible = specimen.id !== lurker.id || secretVisible;
            return (
              <div className={`journal-stamp ${isObserved ? "is-found" : ""}`} key={specimen.id}>
                <span>{isObserved ? specimen.number : visible ? specimen.number : "—"}</span>
                <strong>{isObserved ? specimen.title : visible ? "Seen, not logged" : "Undocumented"}</strong>
                <em>{isObserved ? "OBSERVED" : visible ? "SIGHTING ONLY" : "NOT YET LOGGED"}</em>
              </div>
            );
          })}
        </div>
      </section>

      <footer>
        <div>
          <strong>The Internet Field Guide</strong>
          <span>Vol. I · Digital Fauna</span>
        </div>
        <p>Every live field plate is drawn in code with AniDoodle.</p>
        <a href="https://github.com/alexgreensh/anidoodle" target="_blank" rel="noreferrer">
          Study the drawing engine ↗
        </a>
      </footer>
    </main>
  );
}
