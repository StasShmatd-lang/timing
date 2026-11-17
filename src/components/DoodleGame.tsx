import { useEffect, useMemo, useRef, useState } from "react";
import { hostLinesFor } from "../lib/buildTiming";
import type { Answers, TimingBlock } from "../types";
import { HostPopup } from "./HostPopup";

type Props = {
  answers: Answers;
  blocks: TimingBlock[];
  onFinish: () => void;
};

const SEG = 280;
const GROUND = 72;
const PLAYER_SIZE = 64;

export function DoodleGame({ answers, blocks, onFinish }: Props) {
  const [stage, setStage] = useState(0);
  const [playerX, setPlayerX] = useState(40);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [hostText, setHostText] = useState<string | null>(null);
  const [showWaiter, setShowWaiter] = useState(false);
  const [showCoord, setShowCoord] = useState(false);
  const [gastroReady, setGastroReady] = useState(true);
  const [landed, setLanded] = useState(true);
  const [hop, setHop] = useState(0);
  const pendingAdvance = useRef(false);
  const animRef = useRef<number | null>(null);

  const lines = useMemo(
    () => hostLinesFor(blocks, answers),
    [blocks, answers],
  );

  const current = blocks[stage];
  const worldWidth = Math.max(blocks.length * SEG + 400, 800);
  const cameraX = Math.max(0, playerX - 160);

  useEffect(() => {
    const line = lines.find((l) => l.atStage === stage);
    if (line) setHostText(line.text);
  }, [stage, lines]);

  useEffect(() => {
    pendingAdvance.current = false;
    if (!current) return;

    if (current.kind !== "gastro") {
      setShowWaiter(false);
      setShowCoord(false);
      setGastroReady(true);
      return;
    }

    setGastroReady(false);
    setShowWaiter(true);
    setShowCoord(false);

    const tCoord = window.setTimeout(() => {
      setShowCoord(true);
      setHostText(
        "Координатор спасает сервировку — вино не прольётся на тайминг.",
      );
    }, 900);

    const tReady = window.setTimeout(() => {
      setGastroReady(true);
      if (pendingAdvance.current) {
        pendingAdvance.current = false;
        void runTo(stage + 1);
      }
    }, 2200);

    const tHide = window.setTimeout(() => {
      setShowWaiter(false);
      setShowCoord(false);
    }, 4500);

    return () => {
      window.clearTimeout(tCoord);
      window.clearTimeout(tReady);
      window.clearTimeout(tHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, current?.kind]);

  const runTo = (nextIndex: number) =>
    new Promise<void>((resolve) => {
      if (running) {
        resolve();
        return;
      }
      if (nextIndex >= blocks.length) {
        onFinish();
        resolve();
        return;
      }
      setRunning(true);
      setLanded(false);
      const target = 40 + nextIndex * SEG;
      const start = playerX;
      const dist = target - start;
      const duration = Math.min(1100, 420 + Math.abs(dist) * 1.1);
      const t0 = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const ease = 1 - Math.pow(1 - t, 3);
        const x = start + dist * ease;
        setPlayerX(x);
        setHop(Math.sin(ease * Math.PI) * 42);
        if (t < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          setPlayerX(target);
          setHop(0);
          setStage(nextIndex);
          setClicks(0);
          setRevealed(0);
          setRunning(false);
          setLanded(true);
          resolve();
        }
      };
      animRef.current = requestAnimationFrame(tick);
    });

  useEffect(
    () => () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    },
    [],
  );

  const onRevealOrAdvance = () => {
    if (running || !landed) return;

    if (clicks === 0) {
      setClicks(1);
      setRevealed(1);
      return;
    }

    if (clicks === 1) {
      setClicks(2);
      setRevealed(2);
      return;
    }

    // ready to run forward
    if (current?.kind === "gastro" && !gastroReady) {
      pendingAdvance.current = true;
      return;
    }

    if (stage >= blocks.length - 1) {
      onFinish();
      return;
    }
    void runTo(stage + 1);
  };

  const descParts = current
    ? [
        current.description.slice(0, Math.ceil(current.description.length / 2)),
        current.description.slice(Math.ceil(current.description.length / 2)),
      ]
    : ["", ""];

  const cta =
    clicks < 2
      ? clicks === 0
        ? "Открыть смысл этапа"
        : "Открыть продолжение"
      : stage >= blocks.length - 1
        ? "К итоговому таймингу"
        : "Бежать дальше →";

  return (
    <section className="mario">
      <div className="panel mario__intro">
        <img src="/brand/logo.png" alt="" style={{ width: 64 }} />
        <h2>Пробег по таймингу</h2>
        <p className="lede">
          Аватар с вашим лицом бежит вперёд как по уровню. Пройденные этапы
          остаются сзади. Два касания — смысл; затем — прыжок дальше.
        </p>
      </div>

      <div className="mario-stage" data-testid="mario-stage">
        <div
          className="mario-world"
          style={{
            width: worldWidth,
            transform: `translateX(${-cameraX}px)`,
          }}
        >
          <div className="mario-sky" />
          <div className="mario-ground" style={{ width: worldWidth }} />

          {blocks.map((b, i) => {
            const left = 40 + i * SEG;
            const past = i < stage;
            const active = i === stage;
            return (
              <div
                key={b.id}
                className={`mario-flag ${past ? "is-past" : ""} ${active ? "is-active" : ""}`}
                style={{ left }}
              >
                <div className="mario-flag__pole" />
                <div className="mario-flag__plate">
                  <strong>{b.title}</strong>
                  <span>{b.minutes} мин</span>
                </div>
              </div>
            );
          })}

          {/* trail dust behind */}
          {blocks.slice(0, stage).map((b, i) => (
            <div
              key={`trail-${b.id}`}
              className="mario-trail"
              style={{ left: 40 + i * SEG }}
            />
          ))}

          <div
            className={`mario-player ${running ? "is-running" : ""}`}
            style={{
              left: playerX,
              bottom: GROUND + 8 + hop,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            }}
          >
            {answers.photoDataUrl ? (
              <img src={answers.photoDataUrl} alt={answers.name} />
            ) : (
              <span>
                {answers.name.trim().slice(0, 1).toUpperCase() || "?"}
              </span>
            )}
          </div>

          {showWaiter ? (
            <div
              className="waiter"
              data-testid="waiter"
              style={{ left: playerX + 90, bottom: GROUND + 90 }}
            >
              Официант разливает вино…
            </div>
          ) : null}
          {showCoord ? (
            <div
              className="coordinator"
              data-testid="coordinator"
              style={{ left: playerX - 40, bottom: GROUND + 90 }}
            >
              Координатор спасает!
            </div>
          ) : null}
        </div>
      </div>

      <article className="stage-card">
        <div className="mario-progress-dots">
          {blocks.map((b, i) => (
            <span
              key={b.id}
              className={i < stage ? "done" : i === stage ? "now" : ""}
            />
          ))}
        </div>
        <h3>{current?.title}</h3>
        {revealed >= 1 ? (
          <p className="reveal-line">
            <span key={`a-${stage}-1`}>{descParts[0]}</span>
          </p>
        ) : (
          <p style={{ color: "var(--mist)" }}>
            Коснитесь кнопки — откроется первая часть режиссуры этапа.
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
        {current?.kind === "gastro" && !gastroReady ? (
          <p style={{ marginTop: "0.6rem", color: "var(--gold-soft)" }}>
            Сцена сервиса: официант → координатор…
          </p>
        ) : null}

        <div className="btn-row" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="btn"
            data-testid="mario-action"
            disabled={running}
            onClick={onRevealOrAdvance}
          >
            {cta}
          </button>
        </div>
      </article>

      <HostPopup text={hostText} onClose={() => setHostText(null)} />
    </section>
  );
}
