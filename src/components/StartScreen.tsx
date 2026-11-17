import { useRef, useState } from "react";
import type { Gender } from "../types";

type Props = {
  name: string;
  gender: Gender;
  photoDataUrl: string | null;
  onChange: (patch: {
    name?: string;
    gender?: Gender;
    photoDataUrl?: string | null;
  }) => void;
  onContinue: () => void;
};

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

export function StartScreen({
  name,
  gender,
  photoDataUrl,
  onChange,
  onContinue,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const onFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Нужно изображение лица.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ photoDataUrl: String(reader.result) });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const useDemoFace = async () => {
    setLoadingDemo(true);
    try {
      const dataUrl = await urlToDataUrl("/brand/host-face.jpg");
      onChange({ photoDataUrl: dataUrl });
      setError(null);
    } catch {
      setError("Не удалось загрузить демо-фото.");
    } finally {
      setLoadingDemo(false);
    }
  };

  const ready = name.trim().length >= 2 && Boolean(photoDataUrl);

  return (
    <section className="brand-hero">
      <div className="brand-hero__copy">
        <img
          className="brand-logo"
          src="/brand/logo.png"
          alt="BIG event / Stanislav Shmidt"
        />
        <h1>Демо вашего праздника</h1>
        <p>
          Вместе с ведущим собираем тайминг: короткая анкета, подъём по этапам
          и PDF для согласования.
        </p>

        <div className="panel start-form">
          <div className="field">
            <label htmlFor="guest-name">Ваше имя</label>
            <input
              id="guest-name"
              type="text"
              value={name}
              placeholder="Анна"
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Пол для силуэта игрока</label>
            <div className="gender-row">
              <button
                type="button"
                className={`choice ${gender === "female" ? "is-on" : ""}`}
                onClick={() => onChange({ gender: "female" })}
              >
                Женский
              </button>
              <button
                type="button"
                className={`choice ${gender === "male" ? "is-on" : ""}`}
                onClick={() => onChange({ gender: "male" })}
              >
                Мужской
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="face">Фото лица</label>
            <input
              id="face"
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: "0.45rem", padding: "0.55rem 0.85rem" }}
              onClick={() => void useDemoFace()}
              disabled={loadingDemo}
            >
              {loadingDemo ? "Загрузка…" : "Взять демо-фото"}
            </button>
            {photoDataUrl ? (
              <img
                className="avatar-preview"
                src={photoDataUrl}
                alt="Ваше лицо"
                style={{ marginTop: "0.5rem" }}
              />
            ) : null}
            {error ? (
              <span style={{ color: "var(--ember)" }}>{error}</span>
            ) : null}
          </div>

          <div className="btn-row">
            <button
              type="button"
              className="btn"
              disabled={!ready}
              onClick={onContinue}
            >
              Начать анкету
            </button>
          </div>
        </div>
      </div>

      <div className="brand-hero__visual" aria-hidden>
        <span>Режиссура вечера</span>
      </div>
    </section>
  );
}
