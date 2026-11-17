import { useEffect, useMemo, useState } from "react";
import {
  eventTypeQuestion,
  interpolate,
  sectionsFor,
  type Question,
  type QuizSection,
} from "../data/questions";
import type { Answers, EventType } from "../types";

type Props = {
  answers: Answers;
  onPatch: (patch: Partial<Answers>) => void;
  onDone: (finalAnswers: Answers) => void;
  onBack: () => void;
};

type FlatItem = {
  question: Question;
  section: QuizSection | null;
  indexInSection: number;
};

function flatten(answers: Answers): FlatItem[] {
  if (!answers.eventType) {
    return [{ question: eventTypeQuestion, section: null, indexInSection: 0 }];
  }
  const sections = sectionsFor(answers.eventType);
  const items: FlatItem[] = [
    { question: eventTypeQuestion, section: null, indexInSection: 0 },
  ];
  for (const section of sections) {
    section.questions.forEach((q, i) => {
      items.push({ question: q, section, indexInSection: i });
    });
  }
  return items;
}

function readValue(answers: Answers, q: Question): unknown {
  if (q.id === "eventType") return answers.eventType;
  if (q.id === "danceArc") return answers.danceArc;
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
  if (q.id === "ritualStyle") {
    return {
      ...answers,
      ritualStyle: String(raw),
      weddingRituals: raw !== "none",
    };
  }
  if (q.id === "heroFocus" && answers.eventType === "wedding") {
    return {
      ...answers,
      heroFocus: String(raw),
      kidsPresent: raw === "couple-kids",
    };
  }
  return { ...answers, [q.id]: raw };
}

function canAdvance(answers: Answers, q: Question): boolean {
  const v = readValue(answers, q);
  if (q.type === "text") {
    return String(v ?? "").trim().length > 0;
  }
  if (q.type === "number") return Number(v) > 0;
  if (q.id === "eventType") return Boolean(answers.eventType);
  if (q.id === "hasLocation" || q.withLocationField) {
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

  const queue = useMemo(() => flatten(draft), [draft]);
  const safeIndex = Math.min(index, Math.max(queue.length - 1, 0));
  const current = queue[safeIndex];

  if (!current) return null;

  const { question, section, indexInSection } = current;
  const title = question.interpolate
    ? interpolate(question.title, draft)
    : question.title;
  const hint = question.hint
    ? question.interpolate
      ? interpolate(question.hint, draft)
      : question.hint
    : null;

  const progress = ((safeIndex + 1) / Math.max(queue.length, 1)) * 100;
  const currentValue = readValue(draft, question);
  const ready = canAdvance(draft, question);

  const applyValue = (raw: string | number | boolean) => {
    const next = writeValue(draft, question, raw);
    setDraft(next);
    const patch: Partial<Answers> =
      question.id === "eventType"
        ? { eventType: raw as EventType }
        : question.id === "ritualStyle"
          ? {
              ritualStyle: String(raw),
              weddingRituals: raw !== "none",
            }
          : question.id === "heroFocus" && draft.eventType === "wedding"
            ? {
                heroFocus: String(raw),
                kidsPresent: raw === "couple-kids",
              }
            : ({ [question.id]: raw } as Partial<Answers>);
    onPatch(patch);
    return next;
  };

  const goNext = () => {
    if (!ready) return;
    if (safeIndex >= queue.length - 1) {
      onDone(draft);
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <section className="panel q-step q-step--centered">
      <img
        src="/brand/logo.png"
        alt=""
        style={{ width: 72, marginBottom: "0.75rem", opacity: 0.95 }}
      />
      <div className="progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      {section ? (
        <p className="section-chip">
          {section.title} · {section.count}{" "}
          {section.count === 1
            ? "вопрос"
            : section.count < 5
              ? "вопроса"
              : "вопросов"}
          <span>
            {" "}
            · {indexInSection + 1}/{section.count}
          </span>
        </p>
      ) : (
        <p className="section-chip">Старт · выбор формата</p>
      )}

      <h2>{title}</h2>
      {hint ? <p className="lede">{hint}</p> : <p className="lede" />}

      {question.type === "text" ? (
        <div className="field">
          <label htmlFor="q-text">Ответ</label>
          <input
            id="q-text"
            type="text"
            placeholder={question.placeholder}
            value={String(currentValue ?? "")}
            onChange={(e) => applyValue(e.target.value)}
          />
        </div>
      ) : null}

      {question.type === "number" ? (
        <div className="field">
          <label htmlFor="q-num">Число</label>
          <input
            id="q-num"
            type="number"
            min={1}
            placeholder={question.placeholder}
            value={Number(currentValue || "")}
            onChange={(e) => applyValue(Number(e.target.value))}
          />
        </div>
      ) : null}

      {question.type === "choice" && question.options ? (
        <div
          className={`choice-grid ${question.options.length > 2 ? "cols-2" : ""}`}
        >
          {question.options.map((opt) => {
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

      {question.withLocationField && draft.hasLocation ? (
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
