"use client";

import { useEffect, useMemo, useState } from "react";
import { AniDoodlePiece } from "@/components/anidoodle-piece";
import { createSpecimenPiece, type SpecimenKind } from "@/art/pieces/specimens";

const STORAGE_KEY = "tifg:discovered:v1";

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
  },
  {
    id: "notification-goblin",
    number: "002",
    title: "The Notification Goblin",
    scientific: "Badgia compulsiva",
    epitaph: "Feeds on unread badges.",
    habitat: "Dock icons · inboxes · lock screens",
    behaviour: "Multiplies when ignored",
    activity: "Every 4–7 minutes",
    threat: 2,
    note: "Do not make eye contact with the red circle. It interprets attention as food.",
    kind: "goblin",
    seed: 2207,
  },
  {
    id: "the-algorithm",
    number: "003",
    title: "The Algorithm",
    scientific: "Machina obscura",
    epitaph: "Nobody has seen the whole creature.",
    habitat: "Recommendations · rankings · for-you pages",
    behaviour: "Learns what you almost clicked",
    activity: "Continuous",
    threat: 4,
    note: "Specimens disagree on its actual shape. Each observer appears to receive a different animal.",
    kind: "algorithm",
    seed: 3301,
  },
];

const lurker: Specimen = {
  id: "the-lurker",
  number: "???",
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
      className={`specimen-card ${observed ? "is-observed" : ""} ${secret ? "is-secret" : ""}`}
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

      <div className="specimen-art-wrap">
        <AniDoodlePiece
          piece={pieces[specimen.id]}
          state={observed ? "observed" : "idle"}
          className="specimen-art"
          label={`Live field sketch of ${specimen.title}`}
        />
        <span className="sketch-note sketch-note--left" aria-hidden="true">
          responds to movement
        </span>
        <span className="sketch-note sketch-note--right" aria-hidden="true">
          do not tap glass
        </span>
      </div>

      <p className="epitaph">{specimen.epitaph}</p>

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
        <span>{observed ? "Reopen field note" : "Observe specimen"}</span>
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

export function FieldGuide() {
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [secretVisible, setSecretVisible] = useState(false);
  const [secretAnnouncement, setSecretAnnouncement] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) {
        setDiscovered(stored.filter((id): id is string => typeof id === "string"));
        if (stored.includes(lurker.id)) setSecretVisible(true);
      }
    } catch {
      // A field journal should keep working even if local storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (secretVisible) return;

    let timer = window.setTimeout(() => {
      setSecretVisible(true);
      setSecretAnnouncement("A hidden specimen has appeared: The Lurker.");
    }, 10000);

    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setSecretVisible(true);
        setSecretAnnouncement("A hidden specimen has appeared: The Lurker.");
      }, 10000);
    };

    const events: Array<keyof WindowEventMap> = ["pointermove", "pointerdown", "keydown", "scroll"];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));

    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [secretVisible]);

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
          <a href="#journal">Journal</a>
          <span className="journal-count">{String(progress).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
        </nav>
      </header>

      <section className="hero" id="top" data-specimen-root>
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
            <span className="hero-instruction">Move carefully. Some specimens notice you.</span>
          </div>
        </div>

        <div className="hero-plate">
          <div className="plate-label plate-label--top">
            PLATE 01 · PRELIMINARY SIGHTING
          </div>
          <AniDoodlePiece
            piece={pieces["infinite-scroller"]}
            state={observed.has("infinite-scroller") ? "observed" : "idle"}
            className="hero-art"
            label="A live sketch from the Internet Field Guide"
          />
          <div className="plate-caption">
            <span>FIG. A</span>
            <p>Subject became aware of observer at approximately one cursor-length.</p>
          </div>
        </div>

        <span className="hero-margin-note" aria-hidden="true">
          not to scale →
        </span>
      </section>

      <section className="field-preface">
        <span className="section-index">FIELD NOTE 00</span>
        <p>
          The modern browser is a surprisingly rich ecosystem. Most organisms are harmless.
          Several are annoying. A few have learned to optimize for your attention.
        </p>
        <aside>
          <strong>Observation protocol</strong>
          Hover, click and linger. Your journal records the species you inspect.
        </aside>
      </section>

      <section className="specimens-section" id="specimens">
        <div className="section-heading">
          <div>
            <span className="section-index">CATALOGUE · 01—03</span>
            <h2>Common sightings</h2>
          </div>
          <p>Frequently observed in the wild. Approach with a charged battery and reasonable scepticism.</p>
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

      <section className="quiet-zone">
        <div>
          <span className="section-index">OBSERVATION TIP</span>
          <h2>Not every creature likes being chased.</h2>
        </div>
        <p>
          Field researchers report that one undocumented species appears only when the observer
          stops moving long enough to become part of the scenery.
        </p>
        <span className="quiet-zone__timer" aria-hidden="true">··········</span>
      </section>

      {secretVisible && (
        <section className="secret-section" aria-label="Hidden specimen discovered">
          <div className="secret-ribbon">
            <span>UNEXPECTED SIGHTING</span>
            <span>UNEXPECTED SIGHTING</span>
            <span>UNEXPECTED SIGHTING</span>
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
        <div>
          <strong>The Internet Field Guide</strong>
          <span>Vol. I · Digital Fauna</span>
        </div>
        <p>Every creature on this page is drawn in code with AniDoodle.</p>
        <a href="https://github.com/alexgreensh/anidoodle" target="_blank" rel="noreferrer">
          Study the drawing engine ↗
        </a>
      </footer>
    </main>
  );
}
