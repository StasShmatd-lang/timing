import { useMemo, useState } from "react";
import { Footer } from "./components/Footer";
import { DoodleGame } from "./components/DoodleGame";
import { Questionnaire } from "./components/Questionnaire";
import { StartScreen } from "./components/StartScreen";
import { TimingResult } from "./components/TimingResult";
import { defaultAnswers } from "./data/questions";
import { buildTiming } from "./lib/buildTiming";
import type { Answers, Phase, TimingBlock } from "./types";

export default function App() {
  const [phase, setPhase] = useState<Phase>("start");
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [blocks, setBlocks] = useState<TimingBlock[]>([]);

  const patch = (partial: Partial<Answers>) => {
    setAnswers((prev) => ({ ...prev, ...partial }));
  };

  const timingPreview = useMemo(() => buildTiming(answers), [answers]);

  return (
    <div className="app-shell">
      <main className="main-stage">
        {phase === "start" ? (
          <StartScreen
            name={answers.name}
            gender={answers.gender}
            photoDataUrl={answers.photoDataUrl}
            onChange={patch}
            onContinue={() => setPhase("questionnaire")}
          />
        ) : null}

        {phase === "questionnaire" ? (
          <Questionnaire
            answers={answers}
            onPatch={patch}
            onBack={() => setPhase("start")}
            onDone={(finalAnswers) => {
              setAnswers(finalAnswers);
              setBlocks(buildTiming(finalAnswers));
              setPhase("doodle");
            }}
          />
        ) : null}

        {phase === "doodle" ? (
          <DoodleGame
            answers={answers}
            blocks={blocks.length ? blocks : timingPreview}
            onFinish={() => {
              setBlocks((prev) => (prev.length ? prev : timingPreview));
              setPhase("result");
            }}
          />
        ) : null}

        {phase === "result" ? (
          <TimingResult
            answers={answers}
            blocks={blocks.length ? blocks : timingPreview}
            onChangeMinutes={(id, minutes) => {
              setBlocks((prev) =>
                (prev.length ? prev : timingPreview).map((b) =>
                  b.id === id ? { ...b, minutes } : b,
                ),
              );
            }}
            onRestart={() => {
              setAnswers(defaultAnswers());
              setBlocks([]);
              setPhase("start");
            }}
          />
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
