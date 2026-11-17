import type { Answers, HostLine, TimingBlock } from "../types";

function brandLabel(a: Answers): string {
  if (a.eventType === "corporate") {
    return a.companyName.trim() || a.eventTitle.trim() || "компании";
  }
  return a.eventTitle.trim() || "праздника";
}

export function buildTiming(a: Answers): TimingBlock[] {
  const blocks: TimingBlock[] = [];
  const label = brandLabel(a);
  const title = a.eventTitle.trim() || "праздник";

  if (a.hasLocation && a.locationName.trim()) {
    blocks.push({
      id: "location",
      title: `Сбор на площадке «${a.locationName.trim()}»`,
      minutes: 15,
      description: `Гости прибывают на ${a.locationName.trim()}. Координатор встречает, ведущий держит мягкий контакт у входа.`,
      highlight: a.locationName.trim(),
      kind: "location",
    });
  }

  blocks.push({
    id: "welcome",
    title: `Welcome · ${a.welcomeMinutes} мин`,
    minutes: a.welcomeMinutes,
    description: `Фуршет и лёгкое знакомство. Ведущий прогревает зал под настроение «${title}» — без микрофонной жёсткости, с вниманием к герою вечера.`,
    highlight: `${a.guestCount} гостей`,
    kind: "welcome",
  });

  if (a.eventType === "corporate" && a.bossSpeech) {
    blocks.push({
      id: "boss",
      title: `Слово руководителя · ${label}`,
      minutes: 10,
      description: `Короткое официальное открытие от руководства ${label}. Зал настраивается на общий вектор вечера.`,
      highlight: label,
      kind: "toast",
    });
  }

  const pushInteractive = () => {
    blocks.push({
      id: "interactive",
      title: "Разговорный интерактив",
      minutes: 20,
      description: `Живой диалог с залом: истории, микро-игры без сцены «конкурс ради конкурса». Акцент на именах и связях внутри «${title}».`,
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
          ? "Тосты и благодарности команде"
          : "Тосты от близких";
    blocks.push({
      id: "toast",
      title: toastTitle,
      minutes: 15,
      description: `Микрофон у тех, кому есть что сказать. Ведущий держит ритм и бережно передаёт слово — чтобы «${title}» звучал тепло, а не затянуто.`,
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
      title: "Гастропауза",
      minutes: 15,
      description:
        "Сервис, смена блюд, тихий фон. Ведущий не занимает сцену — зал дышит. Здесь же появляется «официант с вином» в демо-игре.",
      highlight: "15 минут",
      kind: "gastro",
    });
  }

  if (a.eventType === "wedding" && a.weddingRituals) {
    blocks.push({
      id: "rituals",
      title: "Свадебные обряды",
      minutes: 25,
      description: `Каравай, семейный очаг или ваш семейный ритуал — оформляем как смысловой пик «${title}», а не как галочку в сценарии.`,
      highlight: "тематический блок",
      kind: "ritual",
    });
  }

  if (a.eventType === "corporate" && a.corpPhotoMeet) {
    blocks.push({
      id: "photo-meet",
      title: "Знакомство через фото",
      minutes: 20,
      description: `Интерактив BIG event: коллеги ${label} находят друг друга по лицу на экране телефона. Лёгкий ice-breaker без неловких кругов «расскажи о себе».`,
      highlight: "наш продукт",
      kind: "photo",
    });
  }

  if (a.exclusiveContests) {
    blocks.push({
      id: "contests",
      title: `Эксклюзивные конкурсы · ${label}`,
      minutes: 25,
      description: `Не шаблон из интернета — конкурсы, собранные под «${title}» и характер зала. Два-три ярких эпизода с понятной наградой.`,
      highlight: label,
      kind: "contest",
    });
  }

  if (a.dancesBeforeDisco) {
    blocks.push({
      id: "dance-warm",
      title:
        a.eventType === "wedding"
          ? "Первый танец и разогрев"
          : "Танцевальный разогрев",
      minutes: 15,
      description:
        "Мягкий выход в движение: несколько треков, приглашение пар, подготовка к дискотеке без резкого скачка громкости.",
      kind: "dance",
    });
  }

  if (a.discoBlocks) {
    blocks.push({
      id: "disco-1",
      title: "Дискотека · блок 1",
      minutes: 30,
      description: "Первый танцевальный сет. Ведущий точечно поднимает зал, DJ держит линию.",
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
      description: "Второй сет — пик энергии и финальные хиты вечера.",
      kind: "disco",
    });
  } else {
    blocks.push({
      id: "disco",
      title: "Дискотека",
      minutes: 60,
      description: "Единый танцевальный блок без жёсткой нарезки — гибкий ритм под зал.",
      kind: "disco",
    });
  }

  blocks.push({
    id: "finale",
    title: `Финал «${title}»`,
    minutes: 10,
    description: `Благодарность залу, фото на память, мягкое закрытие. Имя ${a.name || "героя"} и название «${title}» звучат ещё раз.`,
    highlight: a.name || title,
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

export function hostLinesFor(blocks: TimingBlock[], a: Answers): HostLine[] {
  const title = a.eventTitle.trim() || "праздник";
  const lines: HostLine[] = [
    {
      id: "h0",
      atStage: 0,
      text: `${a.name || "Друзья"}, начинаем подъём по таймингу «${title}». Два касания на этап — и текст откроется.`,
    },
  ];

  blocks.forEach((b, i) => {
    if (b.kind === "gastro") {
      lines.push({
        id: `waiter-${i}`,
        atStage: i,
        text: "Осторожно: официант разливает вино на гастропаузе… Координатор уже рядом!",
      });
    } else if (b.kind === "welcome") {
      lines.push({
        id: `w-${i}`,
        atStage: i,
        text: "Welcome — это не «просто фуршет». Здесь рождается настроение всего вечера.",
      });
    } else if (b.kind === "contest") {
      lines.push({
        id: `c-${i}`,
        atStage: i,
        text: "Конкурсы только под ваш бренд — шаблонным вечеринкам здесь не место.",
      });
    } else if (b.kind === "photo") {
      lines.push({
        id: `p-${i}`,
        atStage: i,
        text: "Знакомство через фото — наш фирменный ход для корпоративов.",
      });
    } else if (i === blocks.length - 1) {
      lines.push({
        id: `f-${i}`,
        atStage: i,
        text: "Финишная прямая. Дальше — правка минут и PDF для согласования.",
      });
    }
  });

  return lines;
}
