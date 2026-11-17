import { jsPDF } from "jspdf";
import { formatClock, totalMinutes } from "../lib/buildTiming";
import type { Answers, TimingBlock } from "../types";

type Props = {
  answers: Answers;
  blocks: TimingBlock[];
  onChangeMinutes: (id: string, minutes: number) => void;
  onRestart: () => void;
};

const eventLabel = {
  jubilee: "Юбилей",
  wedding: "Свадьба",
  corporate: "Корпоратив",
} as const;

export function TimingResult({
  answers,
  blocks,
  onChangeMinutes,
  onRestart,
}: Props) {
  const total = totalMinutes(blocks);

  const downloadPdf = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;

    try {
      const logo = await loadImage("/brand/logo.png");
      doc.addImage(logo, "PNG", margin, y, 56, 56);
    } catch {
      // logo optional for PDF
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Демо вашего праздника", margin + 70, y + 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("BIG event · Stanislav Shmidt", margin + 70, y + 46);
    y += 80;

    doc.setFontSize(12);
    const meta = [
      `Клиент: ${answers.name}`,
      `Формат: ${answers.eventType ? eventLabel[answers.eventType] : "—"}`,
      `Событие: ${answers.eventTitle || "—"}`,
      answers.companyName ? `Компания: ${answers.companyName}` : null,
      answers.hasLocation && answers.locationName
        ? `Локация: ${answers.locationName}`
        : null,
      `Гостей: ${answers.guestCount}`,
      `Итого: ${formatClock(total)}`,
    ].filter(Boolean) as string[];

    for (const line of meta) {
      doc.text(line, margin, y);
      y += 18;
    }
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Тайминг", margin, y);
    y += 20;
    doc.setFont("helvetica", "normal");

    for (const b of blocks) {
      if (y > 760) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${b.title} — ${b.minutes} мин`, margin, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(b.description, 500);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 12;
    }

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("instagram.com/st.shmidt", margin, 820);
    doc.save(
      `timing-${slug(answers.eventTitle || answers.name || "party")}.pdf`,
    );
  };

  return (
    <section className="panel">
      <img
        src="/brand/logo.png"
        alt=""
        style={{ width: 72, marginBottom: "0.75rem" }}
      />
      <h2>Итоговый тайминг</h2>
      <p className="lede">
        Правите минуты прямо здесь — затем скачайте PDF для согласования с
        площадкой и командой.
      </p>

      <div className="timing-list">
        {blocks.map((b) => (
          <div className="timing-row" key={b.id}>
            <div>
              <h4>{b.title}</h4>
              <p>{b.description}</p>
            </div>
            <label className="minutes-edit">
              <input
                type="number"
                min={1}
                max={180}
                value={b.minutes}
                onChange={(e) =>
                  onChangeMinutes(b.id, Math.max(1, Number(e.target.value) || 1))
                }
              />
              <span>мин</span>
            </label>
          </div>
        ))}
      </div>

      <div className="summary-bar">
        <div>
          Общая длительность: <strong>{formatClock(total)}</strong>
        </div>
        <div className="btn-row">
          <button type="button" className="btn btn-ghost" onClick={onRestart}>
            Заново
          </button>
          <button type="button" className="btn" onClick={() => void downloadPdf()}>
            Скачать PDF
          </button>
        </div>
      </div>
    </section>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function loadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}
