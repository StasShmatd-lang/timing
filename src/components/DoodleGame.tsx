import { useEffect, useMemo, useState } from "react";
import { hostLinesFor } from "../lib/buildTiming";
import type { Answers, TimingBlock } from "../types";
import { HostPopup } from "./HostPopup";

type Props = {
  answers: Answers;
  blocks: TimingBlock[];
  onFinish: () => void;
};

const ROW = 96;

export function DoodleGame({ answers, blocks, onFinish }: Props) {
  const [stage, setStage] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [hostText, setHostText] = useState<string | null>(null);
  const [showWaiter, setShowWaiter] = useState(false);
  const [showCoord, setShowCoord] = useState(false);
  const [doneStages, setDoneStages] = useState<Set<number>>(new Set());

  const lines = useMemo(
    () => hostLinesFor(blocks, answers),
    [blocks, answers],
  );

  const current = blocks[stage];
  const worldOffset = Math.max(0, stage * ROW - ROW * 2);

  useEffect(() => {
    const line = lines.find((l) => l.atStage === stage);
    if (line) {
      setHostText(line.text);
    }
  }, [stage, lines]);

  useEffect(() => {
    if (!current) return;
    if (current.kind === "gastro") {
      setShowWaiter(true);
      setShowCoord(false);
      const t1 = window.setTimeout(() => {
        setShowCoord(true);
        setHostText(
          "Координатор спасает сервировку — вино не прольётся на тайминг.",
        );
      }, 1200);
      const t2 = window.setTimeout(() => {
        setShowWaiter(false);
        setShowCoord(false);
      }, 4200);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    setShowWaiter(false);
    setShowCoord(false);
  }, [current]);

  const onPlatform = (index: number) => {
    if (index !== stage) return;
    const nextClicks = clicks + 1;
    setClicks(nextClicks);

    if (nextClicks === 1) {
      setRevealed(1);
      return;
    }

    if (nextClicks >= 2) {
      setRevealed(2);
      setDoneStages((prev) => new Set(prev).add(index));
      if (index >= blocks.length - 1) {
        window.setTimeout(onFinish, 700);
        return;
      }
      window.setTimeout(() => {
        setStage(index + 1);
        setClicks(0);
        setRevealed(0);
      }, 450);
    }
  };

  const playerBottom = stage * ROW + 78;
  const playerLeft = stage % 2 === 0 ? "18%" : "72%";

  const descParts = current
    ? [
        current.description.slice(0, Math.ceil(current.description.length / 2)),
        current.description.slice(Math.ceil(current.description.length / 2)),
      ]
    : ["", ""];

  return (
    <section className="doodle">
      <div className="panel" style={{ paddingBottom: "0.85rem" }}>
        <img
          src="/brand/logo.png"
          alt=""
          style={{ width: 64, marginBottom: "0.5rem" }}
        />
        <h2 style={{ margin: 0 }}>Подъём по таймингу</h2>
        <p className="lede" style={{ marginBottom: 0 }}>
          Два касания на этап — аватар с вашим лицом поднимается выше. Текст
          открывается постепенно.
        </p>
      </div>

      <div className="doodle-stage">
        <div
          className="doodle-world"
          style={{
            height: blocks.length * ROW + 140,
            bottom: 0,
            top: "auto",
            transform: `translateY(${worldOffset}px)`,
          }}
        >
          {blocks.map((b, i) => {
            const bottom = i * ROW + 24;
            const active = i === stage;
            const done = doneStages.has(i);
            return (
              <button
                key={b.id}
                type="button"
                className={`platform ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}
                style={{ bottom }}
                onClick={() => onPlatform(i)}
              >
                <span className="platform__title">{b.title}</span>
                <span className="platform__meta">{b.minutes} мин</span>
              </button>
            );
          })}

          {answers.photoDataUrl ? (
            <img
              className="player"
              src={answers.photoDataUrl}
              alt={answers.name}
              style={{ bottom: playerBottom, left: playerLeft }}
            />
          ) : (
            <div
              className="player player-fallback"
              style={{ bottom: playerBottom, left: playerLeft }}
              aria-label={answers.name}
            >
              {answers.name.trim().slice(0, 1).toUpperCase() ||
                (answers.gender === "female" ? "А" : "И")}
            </div>
          )}

          {showWaiter ? (
            <div className="waiter" style={{ bottom: stage * ROW + 100 }}>
              Официант разливает вино…
            </div>
          ) : null}
          {showCoord ? (
            <div className="coordinator" style={{ bottom: stage * ROW + 100 }}>
              Координатор спасает!
            </div>
          ) : null}
        </div>
      </div>

      <article className="stage-card">
        <h3>{current?.title}</h3>
        {revealed >= 1 ? (
          <p className="reveal-line">
            <span key={`a-${stage}-1`}>{descParts[0]}</span>
          </p>
        ) : (
          <p style={{ color: "var(--mist)" }}>
            Коснитесь активной площадки — откроется первая часть описания.
          </p>
        )}
        {revealed >= 2 ? (
          <p className="reveal-line" style={{ marginTop: "0.55rem" }}>
            <span key={`a-${stage}-2`}>{descParts[1]}</span>
            {current?.highlight ? (
              <>
                {" "}
                <strong style={{ color: "var(--gold-soft)" }}>
                  {current.highlight}
                </strong>
              </>
            ) : null}
          </p>
        ) : null}
      </article>

      <HostPopup text={hostText} onClose={() => setHostText(null)} />
    </section>
  );
}
