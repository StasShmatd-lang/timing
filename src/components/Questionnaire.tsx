import { useEffect, useMemo, useState } from "react";
import {
  eventTypeQuestion,
  interpolate,
  questionsFor,
  type Question,
} from "../data/questions";
import type { Answers, EventType } from "../types";

type Props = {
  answers: Answers;
  onPatch: (patch: Partial<Answers>) => void;
  onDone: (finalAnswers: Answers) => void;
  onBack: () => void;
};

function visibleQuestions(answers: Answers): Question[] {
  const rest = answers.eventType
    ? questionsFor(answers.eventType).filter((q) => !q.when || q.when(answers))
    : [];
  // Keep event type as step 0 so selecting a type does not replace the current question.
  return [eventTypeQuestion, ...rest];
}

function readValue(answers: Answers, q: Question): unknown {
  if (q.id === "eventType") return answers.eventType;
  return answers[q.id as keyof Answers];
}

function writeValue(
  answers: Answers,
  q: Question,
  raw: string | number | boolean,
): Answers {
  if (q.id === "eventType") {
    return { ...answers, eventType: raw as EventType };
  }
  return { ...answers, [q.id]: raw };
}

function canAdvance(answers: Answers, q: Question): boolean {
  const v = readValue(answers, q);
  if (q.type === "text") {
    if (q.id === "companyName") return true;
    return String(v ?? "").trim().length > 0;
  }
  if (q.type === "number") return Number(v) > 0;
  if (q.id === "eventType") return Boolean(answers.eventType);
  if (q.id === "hasLocation") {
    if (v !== true && v !== false) return false;
    if (v === true) return answers.locationName.trim().length > 0;
    return true;
  }
  return v !== null && v !== undefined && v !== "";
}

export function Questionnaire({ answers, onPatch, onDone, onBack }: Props) {
  const [draft, setDraft] = useState<Answers>(answers);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDraft(answers);
  }, [answers]);

  const queue = useMemo(() => visibleQuestions(draft), [draft]);
  const safeIndex = Math.min(index, Math.max(queue.length - 1, 0));
  const current = queue[safeIndex];

  if (!current) return null;

  const title = current.interpolate
    ? interpolate(current.title, draft)
    : current.title;
  const hint = current.hint
    ? current.interpolate
      ? interpolate(current.hint, draft)
      : current.hint
    : null;

  const progress = ((safeIndex + 1) / Math.max(queue.length, 1)) * 100;
  const currentValue = readValue(draft, current);
  const ready = canAdvance(draft, current);

  const applyValue = (raw: string | number | boolean) => {
    const next = writeValue(draft, current, raw);
    setDraft(next);
    onPatch(
      current.id === "eventType"
        ? { eventType: raw as EventType }
        : ({ [current.id]: raw } as Partial<Answers>),
    );
    return next;
  };

  const goNext = () => {
    if (!ready) return;
    const nextQueue = visibleQuestions(draft);
    if (safeIndex >= nextQueue.length - 1) {
      onDone(draft);
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <section className="panel q-step">
      <img
        src="/brand/logo.png"
        alt=""
        style={{ width: 72, marginBottom: "0.75rem", opacity: 0.95 }}
      />
      <div className="progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>
      <h2>{title}</h2>
      {hint ? <p className="lede">{hint}</p> : <p className="lede" />}

      {current.type === "text" ? (
        <div className="field">
          <label htmlFor="q-text">Ответ</label>
          <input
            id="q-text"
            type="text"
            placeholder={current.placeholder}
            value={String(currentValue ?? "")}
            onChange={(e) => applyValue(e.target.value)}
          />
        </div>
      ) : null}

      {current.type === "number" ? (
        <div className="field">
          <label htmlFor="q-num">Число</label>
          <input
            id="q-num"
            type="number"
            min={1}
            placeholder={current.placeholder}
            value={Number(currentValue || "")}
            onChange={(e) => applyValue(Number(e.target.value))}
          />
        </div>
      ) : null}

      {current.type === "choice" && current.options ? (
        <div
          className={`choice-grid ${current.options.length > 2 ? "cols-2" : ""}`}
        >
          {current.options.map((opt) => {
            const on = currentValue === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                className={`choice ${on ? "is-on" : ""}`}
                data-testid={`choice-${String(opt.value)}`}
                onClick={() => applyValue(opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {current.id === "hasLocation" && draft.hasLocation ? (
        <div className="field" style={{ marginTop: "1rem" }}>
          <label htmlFor="q-location">Название площадки</label>
          <input
            id="q-location"
            type="text"
            placeholder="Loft Hall, усадьба…"
            value={draft.locationName}
            onChange={(e) => {
              const locationName = e.target.value;
              const next = { ...draft, locationName };
              setDraft(next);
              onPatch({ locationName });
            }}
          />
        </div>
      ) : null}

      <div className="btn-row" style={{ marginTop: "1.25rem" }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            if (safeIndex <= 0) onBack();
            else setIndex((i) => Math.max(0, i - 1));
          }}
        >
          Назад
        </button>
        <button
          type="button"
          className="btn"
          disabled={!ready}
          data-testid="quiz-next"
          onClick={goNext}
        >
          Далее
        </button>
      </div>
    </section>
  );
}
