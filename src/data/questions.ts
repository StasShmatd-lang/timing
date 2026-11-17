import type { Answers, EventType } from "../types";

export type QuestionOption = {
  label: string;
  value: string | number | boolean;
};

export type Question = {
  id: keyof Answers | "eventType" | "danceArc" | "locationCombo";
  title: string;
  hint?: string;
  type: "text" | "choice" | "number";
  options?: QuestionOption[];
  placeholder?: string;
  interpolate?: boolean;
  /** Special: location name on same step when hasLocation */
  withLocationField?: boolean;
};

export type QuizSection = {
  id: string;
  title: string;
  /** Must equal questions.length */
  count: number;
  questions: Question[];
};

export const eventTypeQuestion: Question = {
  id: "eventType",
  title: "Какой формат этой ночи?",
  hint: "От ответа зависит вся режиссура. Выбираем честно — не «что привычнее».",
  type: "choice",
  options: [
    { label: "Юбилей", value: "jubilee" },
    { label: "Свадьба", value: "wedding" },
    { label: "Корпоратив", value: "corporate" },
  ],
};

const jubileeSections: QuizSection[] = [
  {
    id: "meaning",
    title: "Смысл вечера",
    count: 4,
    questions: [
      {
        id: "eventTitle",
        title: "Как эта ночь звучит, когда её произносят вслух?",
        hint: "Одно имя ляжет в тайминг и в тексты этапов. Не «мероприятие» — ваш вечер.",
        type: "text",
        placeholder: "Юбилей Анны. Пятьдесят.",
      },
      {
        id: "heroFocus",
        title: "На ком держим свет весь вечер?",
        hint: "Остальные гости важны, но кадр один. От него режем конкурсы и длину тостов.",
        type: "choice",
        options: [
          { label: "На юбиляре: зал ему вторит", value: "person" },
          { label: "На диалоге поколений за одним столом", value: "generations" },
          { label: "На друзьях, которые знают его настоящим", value: "friends" },
        ],
      },
      {
        id: "goal",
        title: "Какой тон «{title}» обязан выдержать до конца?",
        hint: "Это закон вечера. Всё, что спорит с тоном, в тайминг не входит.",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Тёплая семейная правда", value: "family" },
          { label: "Вау — чтобы на минуту замолчали", value: "wow" },
          { label: "Достойно и легко, без пафоса", value: "official" },
        ],
      },
      {
        id: "peakMoment",
        title: "Какой момент «{title}» нельзя отдать случайности?",
        hint: "До него ведём. После него новый сюжет не открываем.",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Слово тех, без кого эта дата не состоится", value: "words" },
          { label: "Общий стол, когда зал становится семьёй", value: "table" },
          { label: "Танец, после которого уже не сидят", value: "dance" },
          { label: "Тихий сюрприз, о котором знали двое", value: "surprise" },
        ],
      },
    ],
  },
  {
    id: "venue",
    title: "Площадка и ритм",
    count: 3,
    questions: [
      {
        id: "hasLocation",
        title: "Где собирается «{title}»?",
        hint: "Если зал выбран — напишите имя. Если ещё ищете — выберите «пока ищем».",
        type: "choice",
        interpolate: true,
        withLocationField: true,
        options: [
          { label: "Зал выбран — укажем имя", value: true },
          { label: "Пока ищем", value: false },
        ],
      },
      {
        id: "welcomeMinutes",
        title: "Сколько длится вход, пока «{title}» ещё не начался вслух?",
        hint: "Welcome — не пауза перед программой. За эти минуты зал решает, можно ли здесь быть собой.",
        type: "choice",
        interpolate: true,
        options: [
          { label: "30 минут — короткий сбор", value: 30 },
          { label: "45 минут — фуршет и мягкий вход", value: 45 },
          { label: "60 минут — гости съезжаются волнами", value: 60 },
        ],
      },
      {
        id: "guestCount",
        title: "Сколько человек держат эту ночь?",
        hint: "От числа — плотность интерактива и сколько тостов зал выдержит.",
        type: "number",
        placeholder: "64",
      },
    ],
  },
  {
    id: "voice",
    title: "Зал и голос",
    count: 4,
    questions: [
      {
        id: "toasts",
        title: "Даём микрофон близким на «{title}»?",
        hint: "Либо живые слова по именам, либо вечер без очереди у стойки.",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Да — три-четыре коротких, ведущий держит ритм", value: true },
          { label: "Нет — слово вечера остаётся у вас", value: false },
        ],
      },
      {
        id: "kidsPresent",
        title: "Дети сегодня в зале «{title}»?",
        hint: "От этого — час пика, громкость и что мы не ставим после десяти.",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Да — нужен смысл, не угол с планшетом", value: true },
          { label: "Нет — ночь взрослая", value: false },
        ],
      },
      {
        id: "alcoholLevel",
        title: "Как звучит бар на «{title}»?",
        hint: "Бар либо служит тону, либо спорит с ним.",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Почти сухо — бокал на тост", value: "dry" },
          { label: "Умеренно — вино к столу", value: "moderate" },
          { label: "Щедро — бар открыт, достоинство держит ведущий", value: "open" },
        ],
      },
      {
        id: "interactiveAfter",
        title: "Когда зал «{title}» впервые говорит не тостом?",
        hint: "Разговорный интерактив — не конкурс. После Welcome или после первого тоста.",
        type: "choice",
        interpolate: true,
        options: [
          { label: "После Welcome — пока все в одном дыхании", value: "welcome" },
          { label: "После первого тоста — когда главное имя уже названо", value: "first-toast" },
        ],
      },
    ],
  },
  {
    id: "body",
    title: "Тело ночи",
    count: 3,
    questions: [
      {
        id: "gastroPause",
        title: "Ставим тихие 15 минут, когда сцена молчит, а стол говорит?",
        hint: "Гастропауза — сервис и смена блюд. В игре здесь официант и координатор.",
        type: "choice",
        options: [
          { label: "Да — пятнадцать минут тишины", value: true },
          { label: "Нет — сервис идёт, вечер не останавливается", value: false },
        ],
      },
      {
        id: "danceArc",
        title: "Как «{title}» выходит в танец?",
        hint: "Разогрев перед дискотекой и два сета по 30 — или один слитный час.",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Сначала разогрев, потом дискотека 2×30", value: "warmup-2x30" },
          { label: "Сразу два сета по 30", value: "sets-2x30" },
          { label: "Один слитный час", value: "single-60" },
        ],
      },
      {
        id: "exclusiveContests",
        title: "Нужны конкурсы, которые существуют только у «{title}»?",
        hint: "Не пакет из интернета. Два-три эпизода про этого человека — или ночь на словах и музыке.",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Да — соберём под биографию", value: true },
          { label: "Нет — ночь держится без конкурсов", value: false },
        ],
      },
    ],
  },
];

const weddingSections: QuizSection[] = [
  {
    id: "meaning",
    title: "Смысл вечера",
    count: 4,
    questions: [
      {
        id: "eventTitle",
        title: "Как зовут эту свадьбу, когда её объявляют гостям?",
        hint: "Имена пары, не слово «торжество».",
        type: "text",
        placeholder: "Мария и Иван",
      },
      {
        id: "heroFocus",
        title: "На ком держится свет «{title}»?",
        type: "choice",
        interpolate: true,
        options: [
          { label: "На паре, зал взрослый", value: "couple" },
          { label: "На паре — и дети сегодня в зале", value: "couple-kids" },
          { label: "На родителях: они соавторы, не зрители", value: "parents" },
          { label: "На друзьях, которые довели их до этого дня", value: "friends" },
        ],
      },
      {
        id: "goal",
        title: "Какой тон «{title}» нельзя предать к десерту?",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Тихо и по-настоящему", value: "family" },
          { label: "Праздник, который помнят телом", value: "wow" },
          { label: "Камерный ужин, почти без сцены", value: "official" },
        ],
      },
      {
        id: "peakMoment",
        title: "Ради какого кадра живёт «{title}»?",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Слова, которые пара говорит сама", value: "vows" },
          { label: "Первый танец, после которого встаёт зал", value: "first-dance" },
          { label: "Слово родителей — короткое и их", value: "parents" },
          { label: "Семейный обряд, не номер программы", value: "ritual" },
        ],
      },
    ],
  },
  {
    id: "venue",
    title: "Площадка и ритм",
    count: 3,
    questions: [
      {
        id: "hasLocation",
        title: "Имя места, где «{title}» становится фактом?",
        type: "choice",
        interpolate: true,
        withLocationField: true,
        options: [
          { label: "Площадка есть — впишем имя", value: true },
          { label: "Ещё ищем", value: false },
        ],
      },
      {
        id: "welcomeMinutes",
        title: "Сколько Welcome даём гостям, прежде чем назвать пару?",
        type: "choice",
        options: [
          { label: "30 минут", value: 30 },
          { label: "45 минут", value: 45 },
          { label: "60 минут", value: 60 },
        ],
      },
      {
        id: "guestCount",
        title: "Сколько гостей держат «{title}»?",
        type: "number",
        interpolate: true,
        placeholder: "90",
      },
    ],
  },
  {
    id: "rites",
    title: "Слово и обряды",
    count: 4,
    questions: [
      {
        id: "toasts",
        title: "Родители и близкие говорят на «{title}» сами?",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Да — три-четыре речи, ведущий режет длинноты", value: true },
          { label: "Нет — слово ночи у пары", value: false },
        ],
      },
      {
        id: "ritualStyle",
        title: "Какие знаки семьи входят в «{title}»?",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Каравай и слово тех, кто встречает", value: "loaf" },
          { label: "Семейный очаг", value: "hearth" },
          { label: "Свой знак — соберём по вашей истории", value: "custom" },
          { label: "Без обрядов: ночь держит стол и танец", value: "none" },
        ],
      },
      {
        id: "alcoholLevel",
        title: "Какой бар выдержит тон «{title}», а не перебьёт его?",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Сухо — бокалы на слово", value: "dry" },
          { label: "Вино к столу", value: "moderate" },
          { label: "Открытый бар — ведущий стережёт достоинство", value: "open" },
        ],
      },
      {
        id: "interactiveAfter",
        title: "Когда «{title}» впервые говорит с залом не речью?",
        type: "choice",
        interpolate: true,
        options: [
          { label: "После Welcome", value: "welcome" },
          { label: "После первого тоста", value: "first-toast" },
        ],
      },
    ],
  },
  {
    id: "body",
    title: "Тело ночи",
    count: 3,
    questions: [
      {
        id: "gastroPause",
        title: "Нужны ли «{title}» тихие 15 минут на стол?",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Да — без микрофона", value: true },
          { label: "Нет — ужин идёт сквозь вечер", value: false },
        ],
      },
      {
        id: "danceArc",
        title: "Как пара выводит «{title}» в танец?",
        type: "choice",
        interpolate: true,
        options: [
          { label: "Разогрев, затем дискотека 2×30", value: "warmup-2x30" },
          { label: "Сразу два сета по 30", value: "sets-2x30" },
          { label: "Один слитный час", value: "single-60" },
        ],
      },
      {
        id: "exclusiveContests",
        title: "Собираем конкурсы, которые нельзя перенести на чужую свадьбу?",
        type: "choice",
        options: [
          { label: "Да — два-три эпизода под их историю", value: true },
          { label: "Нет — хватит обряда, стола и танца", value: false },
        ],
      },
    ],
  },
];

const corporateSections: QuizSection[] = [
  {
    id: "meaning",
    title: "Смысл вечера",
    count: 4,
    questions: [
      {
        id: "companyName",
        title: "Каким именем компания называет себя в этом зале?",
        hint: "Не юридическая шапка — слово, которым команда себя узнает.",
        type: "text",
        placeholder: "Север",
      },
      {
        id: "eventTitle",
        title: "Как называется сам вечер «{company}», отдельно от вывески?",
        interpolate: true,
        type: "text",
        placeholder: "Год, который не отдадим случаю",
      },
      {
        id: "goal",
        title: "Зачем «{company}» собрала «{title}»?",
        interpolate: true,
        type: "choice",
        options: [
          { label: "Сшить команду в одно дыхание", value: "team" },
          { label: "Дать вау, о котором говорят в понедельник", value: "wow" },
          { label: "Выдержать протокол и отпустить его вовремя", value: "official" },
        ],
      },
      {
        id: "peakMoment",
        title: "Какой кадр «{title}» нельзя провалить?",
        interpolate: true,
        type: "choice",
        options: [
          { label: "Слово, после которого зал узнал свой год", value: "speech" },
          { label: "Минута, когда отделы наконец перемешались", value: "mix" },
          { label: "Общий кадр, который не стыдно оставить", value: "frame" },
          { label: "Танцпол, где пропали должности", value: "floor" },
        ],
      },
    ],
  },
  {
    id: "venue",
    title: "Площадка и ритм",
    count: 3,
    questions: [
      {
        id: "hasLocation",
        title: "Где «{company}» собирает «{title}»?",
        interpolate: true,
        type: "choice",
        withLocationField: true,
        options: [
          { label: "Площадка есть — напишем имя", value: true },
          { label: "Ещё ищем", value: false },
        ],
      },
      {
        id: "welcomeMinutes",
        title: "Сколько длится Welcome, пока «{company}» ещё не вышла к микрофону?",
        interpolate: true,
        type: "choice",
        options: [
          { label: "30 минут", value: 30 },
          { label: "45 минут", value: 45 },
          { label: "60 минут", value: 60 },
        ],
      },
      {
        id: "guestCount",
        title: "Сколько человек в зале «{company}»?",
        interpolate: true,
        type: "number",
        placeholder: "140",
      },
    ],
  },
  {
    id: "team",
    title: "Команда и слово",
    count: 3,
    questions: [
      {
        id: "bossSpeech",
        title: "Руководитель «{company}» берёт микрофон на «{title}»?",
        interpolate: true,
        type: "choice",
        options: [
          { label: "Да — до восьми минут, затем вечер живой", value: true },
          { label: "Нет — открытие держит ведущий", value: false },
        ],
      },
      {
        id: "teamMix",
        title: "Кто сидит в одном зале — и кто герой «{title}»?",
        interpolate: true,
        type: "choice",
        options: [
          { label: "Своя команда, чужих нет", value: "inner" },
          { label: "Свои и гости: клиенты, партнёры", value: "with-guests" },
          { label: "Руководство говорит, пол слушает — дистанцию снять", value: "ranks" },
          { label: "Разные службы и возрасты — сшить за ночь", value: "blend" },
        ],
      },
      {
        id: "interactiveAfter",
        title: "Когда «{company}» переходит от официального к живому контакту?",
        interpolate: true,
        type: "choice",
        options: [
          { label: "После Welcome и слова руководителя", value: "welcome" },
          { label: "После первого тоста", value: "first-toast" },
        ],
      },
    ],
  },
  {
    id: "moves",
    title: "Фирменные ходы",
    count: 4,
    questions: [
      {
        id: "gastroPause",
        title: "Ставим тихие 15 минут на стол «{company}»?",
        interpolate: true,
        type: "choice",
        options: [
          { label: "Да — сцена молчит, стол говорит", value: true },
          { label: "Нет — сервис на ходу", value: false },
        ],
      },
      {
        id: "corpPhotoMeet",
        title: "Включаем знакомство через фото для «{company}»?",
        hint: "Наш ход: коллеги находят друг друга по лицу. Без круга «расскажите о себе».",
        interpolate: true,
        type: "choice",
        options: [
          { label: "Да — так зал становится одним", value: true },
          { label: "Нет — эти люди и так знакомы", value: false },
        ],
      },
      {
        id: "danceArc",
        title: "Как «{company}» выходит на паркет «{title}»?",
        interpolate: true,
        type: "choice",
        options: [
          { label: "Разогрев, потом 2×30", value: "warmup-2x30" },
          { label: "Сразу два сета по 30", value: "sets-2x30" },
          { label: "Один слитный час", value: "single-60" },
        ],
      },
      {
        id: "exclusiveContests",
        title: "Нужны конкурсы, которые умрут в другой компании?",
        hint: "Только про «{company}» и этот год.",
        interpolate: true,
        type: "choice",
        options: [
          { label: "Да — два-три эпизода под их имена", value: true },
          { label: "Нет — держим слово, стол и танцпол", value: false },
        ],
      },
    ],
  },
];

function assertSections(sections: QuizSection[]) {
  for (const s of sections) {
    if (s.questions.length !== s.count) {
      throw new Error(
        `Section «${s.title}» promises ${s.count} but has ${s.questions.length}`,
      );
    }
  }
}

assertSections(jubileeSections);
assertSections(weddingSections);
assertSections(corporateSections);

export function sectionsFor(eventType: EventType): QuizSection[] {
  if (eventType === "jubilee") return jubileeSections;
  if (eventType === "wedding") return weddingSections;
  return corporateSections;
}

export function questionsFor(eventType: EventType): Question[] {
  return sectionsFor(eventType).flatMap((s) => s.questions);
}

export function interpolate(text: string, answers: Answers): string {
  const title = answers.eventTitle.trim() || "ваш праздник";
  const company =
    answers.companyName.trim() || answers.eventTitle.trim() || "компания";
  const peak = peakLabel(answers.peakMoment) || "главный кадр";
  return text
    .replaceAll("{title}", title)
    .replaceAll("{company}", company)
    .replaceAll("{name}", answers.name.trim() || "гость")
    .replaceAll("{peak}", peak);
}

export function peakLabel(peak: string): string {
  const map: Record<string, string> = {
    words: "слово близких",
    table: "общий стол",
    dance: "танец зала",
    surprise: "тихий сюрприз",
    vows: "слова пары",
    "first-dance": "первый танец",
    parents: "слово родителей",
    ritual: "семейный обряд",
    speech: "слово года",
    mix: "перемешивание отделов",
    frame: "общий кадр",
    floor: "танцпол без должностей",
  };
  return map[peak] || peak;
}

export const defaultAnswers = (): Answers => ({
  name: "",
  gender: "female",
  photoDataUrl: null,
  eventType: null,
  eventTitle: "",
  companyName: "",
  heroFocus: "person",
  goal: "wow",
  peakMoment: "words",
  hasLocation: false,
  locationName: "",
  welcomeMinutes: 45,
  guestCount: 80,
  toasts: true,
  bossSpeech: true,
  kidsPresent: false,
  alcoholLevel: "moderate",
  teamMix: "inner",
  interactiveAfter: "welcome",
  gastroPause: true,
  weddingRituals: true,
  ritualStyle: "loaf",
  corpPhotoMeet: true,
  danceArc: "warmup-2x30",
  exclusiveContests: true,
});
