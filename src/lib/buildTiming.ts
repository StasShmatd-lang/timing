import { interpolate, peakLabel } from "../data/questions";
import type { Answers, HostLine, TimingBlock } from "../types";

function brandLabel(a: Answers): string {
  if (a.eventType === "corporate") {
    return a.companyName.trim() || a.eventTitle.trim() || "компании";
  }
  return a.eventTitle.trim() || "праздника";
}

function dancesBeforeDisco(a: Answers): boolean {
  return a.danceArc === "warmup-2x30";
}

function discoBlocks(a: Answers): boolean {
  return a.danceArc !== "single-60";
}

function weddingRitualsOn(a: Answers): boolean {
  return a.ritualStyle !== "none" && a.eventType === "wedding";
}

export function buildTiming(a: Answers): TimingBlock[] {
  const blocks: TimingBlock[] = [];
  const label = brandLabel(a);
  const title = a.eventTitle.trim() || "праздник";
  const peak = peakLabel(a.peakMoment) || "главный кадр";
  const name = a.name.trim() || "герой";

  if (a.hasLocation && a.locationName.trim()) {
    blocks.push({
      id: "location",
      title: `Порог · ${a.locationName.trim()}`,
      minutes: 15,
      description: interpolate(
        `Гости входят на площадку «{title}». {name} встречает их лично: не бейдж, а взгляд. Всё, что вечером станет ${peak}, начинается с этого порога.`,
        a,
      ),
      highlight: a.locationName.trim(),
      kind: "location",
    });
  }

  blocks.push({
    id: "welcome",
    title: `Welcome · ${a.welcomeMinutes} мин`,
    minutes: a.welcomeMinutes,
    description: interpolate(
      `Фуршет «{title}» длится ровно столько, чтобы зал узнал себя. {name} держит фон, не сцену. Впереди ${peak} — Welcome его тихая рама. Гостей: ${a.guestCount}.`,
      a,
    ),
    highlight: `${a.guestCount} гостей`,
    kind: "welcome",
  });

  if (a.eventType === "corporate" && a.bossSpeech) {
    blocks.push({
      id: "boss",
      title: `Слово руководителя · ${label}`,
      minutes: 8,
      description: interpolate(
        `Руководство «{company}» берёт микрофон коротко и по делу. Зал узнал свой год — дальше вечер живой, без второго протокола.`,
        a,
      ),
      highlight: label,
      kind: "toast",
    });
  }

  const pushInteractive = () => {
    blocks.push({
      id: "interactive",
      title: "Разговорный интерактив",
      minutes: 20,
      description: interpolate(
        `{name} задаёт залу «{title}» один вопрос, на который нельзя ответить «всё хорошо». Так вечер становится общим делом и дорогой к ${peak}.`,
        a,
      ),
      highlight: "контакт с залом",
      kind: "interactive",
    });
  };

  const pushToast = () => {
    if (!a.toasts) return;
    const toastTitle =
      a.eventType === "wedding"
        ? "Тосты и слово близких"
        : a.eventType === "corporate"
          ? "Тосты и благодарности"
          : "Тосты от близких";
    blocks.push({
      id: "toast",
      title: toastTitle,
      minutes: 15,
      description: interpolate(
        `Слово берут те, кого «{title}» не может обойти. {name} следит за дыханием зала: коротко, по имени, без исповеди. К ${peak} эти речи подводят.`,
        a,
      ),
      kind: "toast",
    });
  };

  if (a.interactiveAfter === "welcome") {
    pushInteractive();
    pushToast();
  } else {
    pushToast();
    pushInteractive();
  }

  if (a.gastroPause) {
    blocks.push({
      id: "gastro",
      title: "Гастропауза · 15 мин",
      minutes: 15,
      description: interpolate(
        `Сцена молчит пятнадцать минут: «{title}» имеет право есть. {name} не заполняет паузу. Бар (${a.alcoholLevel}) не спорит с ${peak}. В демо — официант с вином, координатор уже рядом.`,
        a,
      ),
      highlight: "15 минут тишины",
      kind: "gastro",
    });
  }

  if (weddingRitualsOn(a)) {
    blocks.push({
      id: "rituals",
      title: "Свадебные обряды",
      minutes: 25,
      description: interpolate(
        `Обряду «{title}» не нужна бодрая подводка. {name} держит тишину, пока семья делает свой знак. Часто именно здесь живёт ${peak}.`,
        a,
      ),
      highlight: a.ritualStyle,
      kind: "ritual",
    });
  }

  if (a.eventType === "corporate" && a.corpPhotoMeet) {
    blocks.push({
      id: "photo-meet",
      title: "Знакомство через фото",
      minutes: 20,
      description: interpolate(
        `«{company}» знакомится через фото: лицо на экране вместо круга «расскажите о себе». {name} называет одно правило и отходит. Лёгкость до ${peak}.`,
        a,
      ),
      highlight: "наш продукт",
      kind: "photo",
    });
  }

  if (a.exclusiveContests) {
    blocks.push({
      id: "contests",
      title: `Эксклюзивные конкурсы · ${label}`,
      minutes: 25,
      description: interpolate(
        `Два-три эпизода, которые нельзя перенести на чужой «{title}». {name} не привозит пакет. Награда простая, ставка — их ${peak}.`,
        a,
      ),
      highlight: label,
      kind: "contest",
    });
  }

  if (dancesBeforeDisco(a)) {
    blocks.push({
      id: "dance-warm",
      title:
        a.eventType === "wedding"
          ? "Первый танец и разогрев"
          : "Танцевальный разогрев",
      minutes: 15,
      description: interpolate(
        `Перед дискотекой «{title}» — мягкий разогрев. {name} зовёт в шаг, громкость не прыгает. Если ${peak} танцевальный — ему нужен разгон.`,
        a,
      ),
      kind: "dance",
    });
  }

  if (discoBlocks(a)) {
    blocks.push({
      id: "disco-1",
      title: "Дискотека · блок 1",
      minutes: 30,
      description: interpolate(
        `Первый сет поднимает «{title}». {name} выходит точечно. Паркет зовут, не толкают.`,
        a,
      ),
      kind: "disco",
    });
    blocks.push({
      id: "disco-pause",
      title: "Пауза между сетами",
      minutes: 10,
      description: "Вода, воздух, короткие объявления. Координатор контролирует сервис.",
      kind: "disco",
    });
    blocks.push({
      id: "disco-2",
      title: "Дискотека · блок 2",
      minutes: 30,
      description: interpolate(
        `Второй сет не отпускает. ${peak} здесь либо вспыхивает, либо получает тело.`,
        a,
      ),
      kind: "disco",
    });
  } else {
    blocks.push({
      id: "disco",
      title: "Дискотека · 60 мин",
      minutes: 60,
      description: interpolate(
        `Один слитный час «{title}». Гибкий ритм без жёсткой нарезки — под дыхание зала.`,
        a,
      ),
      kind: "disco",
    });
  }

  blocks.push({
    id: "finale",
    title: `Финал · ${title}`,
    minutes: 10,
    description: interpolate(
      `{name} называет «{title}» в последний раз и не открывает новый сюжет. ${peak} не пересказывают — его оставляют в зале.`,
      a,
    ),
    highlight: name,
    kind: "finale",
  });

  return blocks;
}

export function totalMinutes(blocks: TimingBlock[]): number {
  return blocks.reduce((sum, b) => sum + b.minutes, 0);
}

export function formatClock(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m} мин`;
  return `${h} ч ${m.toString().padStart(2, "0")} мин`;
}

const HOST_BY_KIND: Record<string, string> = {
  location: "Порог уже часть вечера. Гостей встречаем как людей этой ночи, не как поток.",
  welcome: "Welcome не заполняет дыру. За эти минуты зал решает, дышит ли он.",
  toast: "Микрофон только тем, у кого есть имя и одна мысль. Очередь «и я» гасим.",
  interactive: "Один точный вопрос залу. Вечер становится разговором, не программой.",
  gastro: "Пятнадцать минут тишины. Официант с вином уже в кадре — координатор тоже.",
  ritual: "Обряд не объявляют бодро. Здесь зал говорит тише — и стоит.",
  photo: "Знакомство лицами, не кругом «о себе». Наш ход, и он лёгкий.",
  dance: "До двух сетов — короткий разогрев. Громкость не прыгает.",
  disco: "Первый сет поднимает, пауза даёт воздух, второй забирает пик в тело.",
  contest: "Конкурс живёт только внутри этой ночи. Чужой сценарий в зал не вносим.",
  finale: "Закрываем одной фразой. Пик не пересказываем — его уносят с собой.",
};

export function hostLinesFor(blocks: TimingBlock[], a: Answers): HostLine[] {
  const title = a.eventTitle.trim() || "праздник";
  const lines: HostLine[] = [
    {
      id: "h0",
      atStage: 0,
      text: `${a.name || "Друзья"}, бежим по таймингу «${title}». Вперёд — как по уровню. Сзади остаётся пройденный вечер.`,
    },
  ];

  blocks.forEach((b, i) => {
    const template = HOST_BY_KIND[b.kind];
    if (template) {
      lines.push({ id: `k-${i}`, atStage: i, text: interpolate(template, a) });
    }
  });

  return lines;
}
