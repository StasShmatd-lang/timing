import type { Answers, EventType } from "../types";

export type QuestionOption = {
  label: string;
  value: string | number | boolean;
};

export type Question = {
  id: keyof Answers | "eventType";
  title: string;
  hint?: string;
  type: "text" | "choice" | "number";
  options?: QuestionOption[];
  placeholder?: string;
  when?: (a: Answers) => boolean;
  interpolate?: boolean;
};

export const eventTypeQuestion: Question = {
  id: "eventType",
  title: "Какой формат праздника?",
  hint: "От выбора зависит пул вопросов и режиссура тайминга.",
  type: "choice",
  options: [
    { label: "Юбилей", value: "jubilee" },
    { label: "Свадьба", value: "wedding" },
    { label: "Корпоратив", value: "corporate" },
  ],
};

const jubileeQuestions: Question[] = [
  {
    id: "eventTitle",
    title: "Как называется праздник?",
    hint: "Имя подставим в тексты этапов и в тайминг.",
    type: "text",
    placeholder: "Юбилей Анны",
  },
  {
    id: "goal",
    title: "Главная цель вечера «{title}»?",
    interpolate: true,
    type: "choice",
    options: [
      { label: "Тёплая семейная атмосфера", value: "family" },
      { label: "Вау-эффект и эмоции", value: "wow" },
      { label: "Официально, но легко", value: "official" },
    ],
  },
  {
    id: "hasLocation",
    title: "Локация уже выбрана?",
    hint: "Если да — укажите название площадки на этом шаге.",
    type: "choice",
    options: [
      { label: "Да — добавим в тайминг", value: true },
      { label: "Пока нет", value: false },
    ],
  },
  {
    id: "welcomeMinutes",
    title: "Длительность welcome",
    type: "choice",
    options: [
      { label: "30 минут", value: 30 },
      { label: "45 минут", value: 45 },
      { label: "60 минут", value: 60 },
    ],
  },
  {
    id: "guestCount",
    title: "Сколько примерно гостей?",
    type: "number",
    placeholder: "80",
  },
  {
    id: "toasts",
    title: "Тосты от близких на «{title}»?",
    interpolate: true,
    type: "choice",
    options: [
      { label: "Да", value: true },
      { label: "Нет", value: false },
    ],
  },
  {
    id: "interactiveAfter",
    title: "Разговорный интерактив — после чего?",
    hint: "Дальше по режиссуре: гастропауза 15 мин, разогрев, дискотека 2×30, эксклюзивные конкурсы.",
    type: "choice",
    options: [
      { label: "После welcome", value: "welcome" },
      { label: "После первого тоста", value: "first-toast" },
    ],
  },
  {
    id: "exclusiveContests",
    title: "Эксклюзивные конкурсы под «{title}»?",
    interpolate: true,
    type: "choice",
    options: [
      { label: "Да, фирменные", value: true },
      { label: "Без конкурсов", value: false },
    ],
  },
];

const weddingQuestions: Question[] = [
  {
    id: "eventTitle",
    title: "Как называется свадьба?",
    hint: "Например: «Свадьба Марии и Ивана».",
    type: "text",
    placeholder: "Свадьба Марии и Ивана",
  },
  {
    id: "goal",
    title: "Главный акцент «{title}»?",
    interpolate: true,
    type: "choice",
    options: [
      { label: "Трогательная церемония", value: "family" },
      { label: "Вау и праздник", value: "wow" },
      { label: "Камерный ужин", value: "official" },
    ],
  },
  {
    id: "hasLocation",
    title: "Локация выбрана?",
    hint: "Если да — сразу впишите название площадки.",
    type: "choice",
    options: [
      { label: "Да", value: true },
      { label: "Ещё нет", value: false },
    ],
  },
  {
    id: "welcomeMinutes",
    title: "Welcome гостей",
    type: "choice",
    options: [
      { label: "30 минут", value: 30 },
      { label: "45 минут", value: 45 },
      { label: "60 минут", value: 60 },
    ],
  },
  {
    id: "guestCount",
    title: "Число гостей",
    type: "number",
    placeholder: "60",
  },
  {
    id: "toasts",
    title: "Слово родителей / тосты?",
    type: "choice",
    options: [
      { label: "Да", value: true },
      { label: "Нет", value: false },
    ],
  },
  {
    id: "weddingRituals",
    title: "Тематические обряды (каравай, очаг…)?",
    hint: "Интерактив после welcome/тоста, гастропауза 15 мин, первый танец, дискотека 2×30.",
    type: "choice",
    options: [
      { label: "Да, нужны", value: true },
      { label: "Без обрядов", value: false },
    ],
  },
  {
    id: "interactiveAfter",
    title: "Разговорный интерактив — после чего?",
    type: "choice",
    options: [
      { label: "После welcome", value: "welcome" },
      { label: "После первого тоста", value: "first-toast" },
    ],
  },
  {
    id: "exclusiveContests",
    title: "Эксклюзивные конкурсы для «{title}»?",
    interpolate: true,
    type: "choice",
    options: [
      { label: "Да", value: true },
      { label: "Нет", value: false },
    ],
  },
];

const corporateQuestions: Question[] = [
  {
    id: "eventTitle",
    title: "Название события",
    type: "text",
    placeholder: "New Year Party 2026",
  },
  {
    id: "companyName",
    title: "Название компании",
    hint: "Подставим в тексты тайминга, где уместно.",
    type: "text",
    placeholder: "Softline",
  },
  {
    id: "goal",
    title: "Цель вечера для «{company}»?",
    interpolate: true,
    type: "choice",
    options: [
      { label: "Сплотить команду", value: "team" },
      { label: "Вау-эффект", value: "wow" },
      { label: "Официальный формат + лёгкость", value: "official" },
    ],
  },
  {
    id: "hasLocation",
    title: "Локация выбрана?",
    hint: "Если да — укажите площадку здесь же.",
    type: "choice",
    options: [
      { label: "Да", value: true },
      { label: "Нет", value: false },
    ],
  },
  {
    id: "welcomeMinutes",
    title: "Welcome",
    type: "choice",
    options: [
      { label: "30 минут", value: 30 },
      { label: "45 минут", value: 45 },
      { label: "60 минут", value: 60 },
    ],
  },
  {
    id: "guestCount",
    title: "Число гостей",
    type: "number",
    placeholder: "120",
  },
  {
    id: "bossSpeech",
    title: "Слово руководителя «{company}»?",
    interpolate: true,
    hint: "Тосты, интерактив, гастропауза 15 мин, знакомство через фото, дискотека 2×30.",
    type: "choice",
    options: [
      { label: "Да", value: true },
      { label: "Нет", value: false },
    ],
  },
  {
    id: "interactiveAfter",
    title: "Разговорный интерактив — после чего?",
    type: "choice",
    options: [
      { label: "После welcome / слова руководителя", value: "welcome" },
      { label: "После первого тоста", value: "first-toast" },
    ],
  },
  {
    id: "corpPhotoMeet",
    title: "Знакомство через фото (наш продукт) для «{company}»?",
    interpolate: true,
    type: "choice",
    options: [
      { label: "Да, включаем", value: true },
      { label: "Пока нет", value: false },
    ],
  },
];

export function questionsFor(eventType: EventType): Question[] {
  if (eventType === "jubilee") return jubileeQuestions;
  if (eventType === "wedding") return weddingQuestions;
  return corporateQuestions;
}

export function interpolate(text: string, answers: Answers): string {
  const title = answers.eventTitle.trim() || "ваш праздник";
  const company =
    answers.companyName.trim() ||
    answers.eventTitle.trim() ||
    "компания";
  return text
    .replaceAll("{title}", title)
    .replaceAll("{company}", company)
    .replaceAll("{name}", answers.name.trim() || "гость");
}

export const defaultAnswers = (): Answers => ({
  name: "",
  gender: "female",
  photoDataUrl: null,
  eventType: null,
  eventTitle: "",
  companyName: "",
  goal: "wow",
  hasLocation: false,
  locationName: "",
  welcomeMinutes: 45,
  guestCount: 80,
  toasts: true,
  bossSpeech: true,
  interactiveAfter: "welcome",
  gastroPause: true,
  weddingRituals: true,
  corpPhotoMeet: true,
  dancesBeforeDisco: true,
  discoBlocks: true,
  exclusiveContests: true,
});
