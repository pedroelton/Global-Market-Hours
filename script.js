"use strict";

/*
  GLOBAL MARKET HOURS
  -----------------------------------------------------------------------------
  Horários regulares confirmados em páginas oficiais das bolsas em julho de 2026.
  O painel usa Intl.DateTimeFormat para respeitar automaticamente o horário de verão.

  Para atualizar feriados futuros, edite HOLIDAYS e SESSION_OVERRIDES abaixo.
*/

const DAY_MS = 86_400_000;
const SECOND_MS = 1_000;
const VIEWER_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const HOLIDAYS = {
  US_2026: new Set([
    "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25",
    "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25"
  ]),
  UK_2026: new Set([
    "2026-01-01", "2026-04-03", "2026-04-06", "2026-05-04", "2026-05-25",
    "2026-08-31", "2026-12-25", "2026-12-28"
  ]),
  JP_2026: new Set([
    "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-12", "2026-02-11",
    "2026-02-23", "2026-03-20", "2026-04-29", "2026-05-03", "2026-05-04",
    "2026-05-05", "2026-05-06", "2026-07-20", "2026-08-11", "2026-09-21",
    "2026-09-22", "2026-09-23", "2026-10-12", "2026-11-03", "2026-11-23",
    "2026-12-31"
  ])
};

const SESSION_OVERRIDES = {
  // NYSE / Nasdaq — fechamento antecipado às 13:00 ET; sessão estendida até 17:00.
  "2026-11-27": {
    "nyse-cash": { end: "13:00" },
    "nyse-after": { start: "13:00", end: "17:00" },
    "nasdaq-cash": { end: "13:00" },
    "nasdaq-after": { start: "13:00", end: "17:00" }
  },
  "2026-12-24": {
    "nyse-cash": { end: "13:00" },
    "nyse-after": { start: "13:00", end: "17:00" },
    "nasdaq-cash": { end: "13:00" },
    "nasdaq-after": { start: "13:00", end: "17:00" },
    "lse-cash": { end: "12:30" },
    "lse-close-auction": { start: "12:30", end: "12:35" },
    "lse-cpx": { start: "12:35", end: "12:40" },
    "lse-post": { start: "12:40", end: "13:15" }
  },
  "2026-12-31": {
    "lse-cash": { end: "12:30" },
    "lse-close-auction": { start: "12:30", end: "12:35" },
    "lse-cpx": { start: "12:35", end: "12:40" },
    "lse-post": { start: "12:40", end: "13:15" }
  }
};

const MARKETS = [
  {
    id: "nyse",
    seal: "NYSE",
    city: "New York",
    name: "New York Stock Exchange",
    timezone: "America/New_York",
    timezoneLabel: "Eastern Time · ET",
    holidayCalendar: "US_2026",
    source: "NYSE official hours",
    sessions: [
      {
        id: "nyse-pre",
        name: "Pré-abertura",
        detail: "Entrada e fila de ordens",
        start: "06:30",
        end: "09:30",
        startDays: [1, 2, 3, 4, 5],
        type: "pre"
      },
      {
        id: "nyse-cash",
        name: "Mercado à vista",
        detail: "Core Trading Session",
        start: "09:30",
        end: "16:00",
        startDays: [1, 2, 3, 4, 5],
        type: "cash"
      },
      {
        id: "nyse-after",
        name: "Pós-mercado",
        detail: "NYSE Arca · Late Session",
        start: "16:00",
        end: "20:00",
        startDays: [1, 2, 3, 4, 5],
        type: "after"
      }
    ]
  },
  {
    id: "nasdaq",
    seal: "NDAQ",
    city: "New York",
    name: "Nasdaq Stock Market",
    timezone: "America/New_York",
    timezoneLabel: "Eastern Time · ET",
    holidayCalendar: "US_2026",
    source: "Nasdaq official hours",
    sessions: [
      {
        id: "nasdaq-pre",
        name: "Pré-mercado",
        detail: "Pre-Market Session",
        start: "04:00",
        end: "09:30",
        startDays: [1, 2, 3, 4, 5],
        type: "pre"
      },
      {
        id: "nasdaq-cash",
        name: "Mercado à vista",
        detail: "Opening Cross ao Closing Cross",
        start: "09:30",
        end: "16:00",
        startDays: [1, 2, 3, 4, 5],
        type: "cash"
      },
      {
        id: "nasdaq-after",
        name: "Pós-mercado",
        detail: "Post-Market Session",
        start: "16:00",
        end: "20:00",
        startDays: [1, 2, 3, 4, 5],
        type: "after"
      }
    ]
  },
  {
    id: "cme",
    seal: "CME",
    city: "Chicago",
    name: "CME Equity Index Futures",
    timezone: "America/Chicago",
    timezoneLabel: "Central Time · CT",
    holidayCalendar: null,
    source: "CME Globex · ES / NQ",
    sessions: [
      {
        id: "cme-globex",
        name: "Futuros de índices",
        detail: "Globex · ES, NQ e micros",
        start: "17:00",
        end: "16:00",
        startDays: [0, 1, 2, 3, 4],
        type: "futures",
        interruptions: [
          { name: "Pausa técnica", start: "15:15", end: "15:30", weekdays: [1, 2, 3, 4, 5] }
        ]
      }
    ]
  },
  {
    id: "lse",
    seal: "LSE",
    city: "London",
    name: "London Stock Exchange",
    timezone: "Europe/London",
    timezoneLabel: "London Time · GMT/BST",
    holidayCalendar: "UK_2026",
    source: "LSE SETS official cycle",
    sessions: [
      {
        id: "lse-pre",
        name: "Pré-negociação",
        detail: "Pre-Trading",
        start: "07:00",
        end: "07:50",
        startDays: [1, 2, 3, 4, 5],
        type: "pre"
      },
      {
        id: "lse-open-auction",
        name: "Leilão de abertura",
        detail: "Opening Auction Call",
        start: "07:50",
        end: "08:00",
        startDays: [1, 2, 3, 4, 5],
        type: "auction"
      },
      {
        id: "lse-cash",
        name: "Mercado à vista",
        detail: "Regular Trading",
        start: "08:00",
        end: "16:30",
        startDays: [1, 2, 3, 4, 5],
        type: "cash"
      },
      {
        id: "lse-close-auction",
        name: "Leilão de fechamento",
        detail: "Closing Auction Call",
        start: "16:30",
        end: "16:35",
        startDays: [1, 2, 3, 4, 5],
        type: "auction"
      },
      {
        id: "lse-cpx",
        name: "Closing Price Crossing",
        detail: "Negociação no preço de fechamento",
        start: "16:35",
        end: "16:40",
        startDays: [1, 2, 3, 4, 5],
        type: "after"
      },
      {
        id: "lse-post",
        name: "Pós-fechamento",
        detail: "Post Close",
        start: "16:40",
        end: "17:15",
        startDays: [1, 2, 3, 4, 5],
        type: "after"
      }
    ]
  },
  {
    id: "ice-ftse",
    seal: "ICE",
    city: "London",
    name: "ICE FTSE 100 Futures",
    timezone: "Europe/London",
    timezoneLabel: "London Time · GMT/BST",
    holidayCalendar: "UK_2026",
    source: "ICE Futures Europe",
    sessions: [
      {
        id: "ice-ftse-pre",
        name: "Pré-abertura dos futuros",
        detail: "FTSE 100 Index Future",
        start: "00:35",
        end: "01:00",
        startDays: [1, 2, 3, 4, 5],
        type: "pre"
      },
      {
        id: "ice-ftse-main",
        name: "Futuros FTSE 100",
        detail: "ICE electronic trading",
        start: "01:00",
        end: "21:00",
        startDays: [1, 2, 3, 4, 5],
        type: "futures"
      }
    ]
  },
  {
    id: "tse",
    seal: "TSE",
    city: "Tokyo",
    name: "Tokyo Stock Exchange",
    timezone: "Asia/Tokyo",
    timezoneLabel: "Japan Standard Time · JST",
    holidayCalendar: "JP_2026",
    source: "Japan Exchange Group",
    sessions: [
      {
        id: "tse-orders-am",
        name: "Aceitação de ordens",
        detail: "Sessão da manhã",
        start: "08:00",
        end: "09:00",
        startDays: [1, 2, 3, 4, 5],
        type: "pre"
      },
      {
        id: "tse-cash-am",
        name: "Mercado à vista · manhã",
        detail: "Morning Session",
        start: "09:00",
        end: "11:30",
        startDays: [1, 2, 3, 4, 5],
        type: "cash"
      },
      {
        id: "tse-orders-pm",
        name: "Aceitação de ordens",
        detail: "Sessão da tarde",
        start: "12:05",
        end: "12:30",
        startDays: [1, 2, 3, 4, 5],
        type: "pre"
      },
      {
        id: "tse-cash-pm",
        name: "Mercado à vista · tarde",
        detail: "Afternoon Session",
        start: "12:30",
        end: "15:30",
        startDays: [1, 2, 3, 4, 5],
        type: "cash"
      }
    ]
  },
  {
    id: "ose",
    seal: "OSE",
    city: "Osaka",
    name: "OSE Index Futures",
    timezone: "Asia/Tokyo",
    timezoneLabel: "Japan Standard Time · JST",
    holidayCalendar: "JP_2026",
    source: "JPX derivatives hours",
    sessions: [
      {
        id: "ose-night",
        name: "Sessão noturna",
        detail: "Nikkei 225 / TOPIX Futures",
        start: "17:00",
        end: "06:00",
        startDays: [1, 2, 3, 4, 5],
        type: "futures"
      },
      {
        id: "ose-pre-day",
        name: "Pré-abertura diurna",
        detail: "Order acceptance",
        start: "08:00",
        end: "08:45",
        startDays: [1, 2, 3, 4, 5],
        type: "pre"
      },
      {
        id: "ose-day",
        name: "Sessão diurna",
        detail: "Zaraba + leilão de fechamento",
        start: "08:45",
        end: "15:45",
        startDays: [1, 2, 3, 4, 5],
        type: "futures"
      }
    ]
  }
];

const marketRuntime = new Map();
const formatters = new Map();

function formatter(timeZone, options) {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.DateTimeFormat("pt-BR", { timeZone, ...options }));
  }
  return formatters.get(key);
}

function getZonedParts(date, timeZone) {
  const parts = formatter(timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    weekday: "short"
  }).formatToParts(date);

  const out = {};
  for (const part of parts) {
    if (part.type !== "literal") out[part.type] = part.value;
  }

  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour),
    minute: Number(out.minute),
    second: Number(out.second),
    weekday: getWeekdayIndex(date, timeZone)
  };
}

function getWeekdayIndex(date, timeZone) {
  const label = formatter(timeZone, { weekday: "short" }).format(date).toLowerCase();
  const map = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sáb: 6, sab: 6 };
  return map[label.slice(0, 3)] ?? 0;
}

function zonedDateTimeToUtc(parts, timeZone) {
  const desired = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0);
  let guess = desired;

  for (let i = 0; i < 4; i += 1) {
    const zoned = getZonedParts(new Date(guess), timeZone);
    const represented = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
    guess += desired - represented;
  }

  return new Date(guess);
}

function localDateFromOffset(baseParts, offsetDays) {
  const date = new Date(Date.UTC(baseParts.year, baseParts.month - 1, baseParts.day) + offsetDays * DAY_MS);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday: date.getUTCDay()
  };
}

function parseTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
}

function dateKey(parts) {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function isHoliday(market, localDate) {
  if (!market.holidayCalendar) return false;
  const calendar = HOLIDAYS[market.holidayCalendar];
  return calendar ? calendar.has(dateKey(localDate)) : false;
}

function resolveSessionTimes(session, localDate) {
  const override = SESSION_OVERRIDES[dateKey(localDate)]?.[session.id] || {};
  return {
    start: override.start || session.start,
    end: override.end || session.end
  };
}

function buildOccurrence(market, session, localDate) {
  const times = resolveSessionTimes(session, localDate);
  const startTime = parseTime(times.start);
  const endTime = parseTime(times.end);

  const startParts = { ...localDate, ...startTime, second: 0 };
  let endLocalDate = { ...localDate };
  const crossesMidnight = endTime.hour * 60 + endTime.minute <= startTime.hour * 60 + startTime.minute;

  if (crossesMidnight) {
    endLocalDate = localDateFromOffset(localDate, 1);
  }

  const endParts = { ...endLocalDate, ...endTime, second: 0 };

  return {
    market,
    session,
    start: zonedDateTimeToUtc(startParts, market.timezone),
    end: zonedDateTimeToUtc(endParts, market.timezone),
    localDate,
    displayStart: times.start,
    displayEnd: times.end
  };
}

function generateOccurrences(market, session, now, horizonDays = 12) {
  const marketNow = getZonedParts(now, market.timezone);
  const occurrences = [];

  for (let offset = -2; offset <= horizonDays; offset += 1) {
    const localDate = localDateFromOffset(marketNow, offset);
    if (!session.startDays.includes(localDate.weekday)) continue;
    if (isHoliday(market, localDate)) continue;
    occurrences.push(buildOccurrence(market, session, localDate));
  }

  return occurrences.sort((a, b) => a.start - b.start);
}

function getInterruptionState(occurrence, now) {
  const interruptions = occurrence.session.interruptions || [];
  if (!interruptions.length) return null;

  const market = occurrence.market;
  const endLocal = getZonedParts(occurrence.end, market.timezone);

  for (const interruption of interruptions) {
    if (!interruption.weekdays.includes(endLocal.weekday)) continue;

    const interruptionDate = {
      year: endLocal.year,
      month: endLocal.month,
      day: endLocal.day,
      weekday: endLocal.weekday
    };
    const startTime = parseTime(interruption.start);
    const endTime = parseTime(interruption.end);
    const start = zonedDateTimeToUtc({ ...interruptionDate, ...startTime, second: 0 }, market.timezone);
    const end = zonedDateTimeToUtc({ ...interruptionDate, ...endTime, second: 0 }, market.timezone);

    if (now >= start && now < end) {
      return { ...interruption, start, end, active: true };
    }

    if (now < start && start >= occurrence.start && start <= occurrence.end) {
      return { ...interruption, start, end, active: false };
    }
  }

  return null;
}

function evaluateSession(market, session, now) {
  const occurrences = generateOccurrences(market, session, now);
  const activeOccurrence = occurrences.find(item => now >= item.start && now < item.end);

  if (activeOccurrence) {
    const interruption = getInterruptionState(activeOccurrence, now);
    if (interruption?.active) {
      return {
        state: "pause",
        label: "RETOMA EM",
        target: interruption.end,
        occurrence: activeOccurrence,
        eventName: `${interruption.name} termina`,
        eventType: "resume"
      };
    }

    if (interruption && now < interruption.start) {
      return {
        state: "open",
        label: "PAUSA EM",
        target: interruption.start,
        occurrence: activeOccurrence,
        eventName: `${interruption.name} começa`,
        eventType: "pause"
      };
    }

    return {
      state: "open",
      label: "ENCERRA EM",
      target: activeOccurrence.end,
      occurrence: activeOccurrence,
      eventName: `${session.name} encerra`,
      eventType: "close"
    };
  }

  const nextOccurrence = occurrences.find(item => item.start > now);
  return {
    state: "closed",
    label: "ABRE EM",
    target: nextOccurrence?.start || null,
    occurrence: nextOccurrence || null,
    eventName: `${session.name} abre`,
    eventType: "open"
  };
}

function formatDuration(ms, compact = false) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (compact) {
    const dayPart = days > 0 ? `${days}d ` : "";
    return `${dayPart}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return { days, hours, minutes, seconds };
}

function formatMarketTime(date, timeZone, includeDate = true) {
  return formatter(timeZone, {
    ...(includeDate ? { weekday: "short", day: "2-digit", month: "short" } : {}),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(date);
}

function formatClock(date, timeZone) {
  return formatter(timeZone, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).format(date);
}

function formatClockDate(date, timeZone) {
  return formatter(timeZone, {
    weekday: "long",
    day: "2-digit",
    month: "short"
  }).format(date);
}

function createMarketCards() {
  const grid = document.getElementById("marketsGrid");

  grid.innerHTML = MARKETS.map(market => `
    <article class="market-card" data-market-id="${market.id}">
      <header class="market-card-header">
        <div class="market-identity">
          <span class="market-seal">${market.seal}</span>
          <div>
            <span class="market-card-kicker">${market.city}</span>
            <h3 class="market-title">${market.name}</h3>
            <span class="market-timezone">${market.timezoneLabel}</span>
          </div>
        </div>
        <div class="market-local-time">
          <strong data-market-clock>--:--:--</strong>
          <span>hora local</span>
        </div>
      </header>

      <div class="sessions-list">
        ${market.sessions.map(session => `
          <div class="session-row" data-session-id="${session.id}">
            <span class="session-marker" aria-hidden="true"></span>
            <div class="session-name">
              <strong>${session.name}</strong>
              <span class="session-hours">${session.start}–${session.end} · ${session.detail}</span>
            </div>
            <div class="session-status">
              <span class="session-status-label">Calculando</span>
              <strong class="session-countdown">--:--:--</strong>
            </div>
          </div>
        `).join("")}
      </div>

      <footer class="market-card-footer">
        <span class="market-source">${market.source}</span>
        <span class="market-state">Fechado</span>
      </footer>
    </article>
  `).join("");

  for (const market of MARKETS) {
    const card = grid.querySelector(`[data-market-id="${market.id}"]`);
    const sessionElements = new Map();
    market.sessions.forEach(session => {
      sessionElements.set(session.id, card.querySelector(`[data-session-id="${session.id}"]`));
    });

    marketRuntime.set(market.id, {
      card,
      clock: card.querySelector("[data-market-clock]"),
      state: card.querySelector(".market-state"),
      sessionElements
    });
  }
}

function updateWorldClocks(now) {
  const clocks = [
    ["new-york", "America/New_York"],
    ["london", "Europe/London"],
    ["tokyo", "Asia/Tokyo"],
    ["viewer", VIEWER_ZONE]
  ];

  for (const [id, zone] of clocks) {
    document.getElementById(`clock-${id}`).textContent = formatClock(now, zone);
    document.getElementById(`date-${id}`).textContent = formatClockDate(now, zone);
  }

  document.getElementById("viewerTimezone").textContent = VIEWER_ZONE.replaceAll("_", " ");
}

function updateMarketCards(now) {
  const allStates = [];
  let activeCount = 0;

  for (const market of MARKETS) {
    const runtime = marketRuntime.get(market.id);
    runtime.clock.textContent = formatClock(now, market.timezone);

    let marketHasActiveSession = false;
    const marketStates = market.sessions.map(session => {
      const state = evaluateSession(market, session, now);
      const row = runtime.sessionElements.get(session.id);
      const label = row.querySelector(".session-status-label");
      const countdown = row.querySelector(".session-countdown");
      const hours = row.querySelector(".session-hours");

      row.classList.remove("is-open", "is-pause", "is-next");
      label.textContent = state.label;
      countdown.textContent = state.target ? formatDuration(state.target - now, true) : "—";

      if (state.occurrence) {
        hours.textContent = `${state.occurrence.displayStart}–${state.occurrence.displayEnd} · ${session.detail}`;
      }

      if (state.state === "open") {
        row.classList.add("is-open");
        marketHasActiveSession = true;
        activeCount += 1;
      } else if (state.state === "pause") {
        row.classList.add("is-pause");
      }

      return { ...state, market, session, row };
    });

    const nextState = marketStates
      .filter(item => item.target)
      .sort((a, b) => a.target - b.target)[0];

    if (nextState && nextState.state === "closed") {
      nextState.row.classList.add("is-next");
    }

    runtime.state.textContent = marketHasActiveSession ? "Em negociação" : "Fechado";
    runtime.state.classList.toggle("open", marketHasActiveSession);
    allStates.push(...marketStates);
  }

  document.getElementById("activeSessionCount").textContent = String(activeCount);
  return allStates;
}

function selectNextEvent(states, now) {
  return states
    .filter(state => state.target && state.target > now)
    .sort((a, b) => a.target - b.target)[0] || null;
}

function describeEvent(event) {
  if (!event) return "Nenhum evento encontrado no horizonte calculado.";

  const action = {
    open: "A sessão começará",
    close: "A sessão terminará",
    pause: "A pausa programada começará",
    resume: "A negociação será retomada"
  }[event.eventType] || "O evento ocorrerá";

  return `${action} no horário oficial de ${event.market.city}.`;
}

function updateHero(nextEvent, now) {
  const heading = document.getElementById("nextEventHeading");
  const description = document.getElementById("nextEventDescription");
  const exchange = document.getElementById("nextEventExchange");
  const marketTime = document.getElementById("nextEventMarketTime");
  const localTime = document.getElementById("nextEventLocalTime");

  if (!nextEvent) {
    heading.textContent = "Nenhum evento futuro encontrado";
    description.textContent = "Amplie o horizonte de cálculo no JavaScript.";
    exchange.textContent = "—";
    marketTime.textContent = "—";
    localTime.textContent = "—";
    return;
  }

  heading.textContent = nextEvent.eventName;
  description.textContent = describeEvent(nextEvent);
  exchange.textContent = nextEvent.market.name;
  marketTime.textContent = `${nextEvent.market.city}: ${formatMarketTime(nextEvent.target, nextEvent.market.timezone)}`;
  localTime.textContent = `Local: ${formatMarketTime(nextEvent.target, VIEWER_ZONE)}`;

  const duration = formatDuration(nextEvent.target - now);
  document.getElementById("heroDays").textContent = String(duration.days).padStart(2, "0");
  document.getElementById("heroHours").textContent = String(duration.hours).padStart(2, "0");
  document.getElementById("heroMinutes").textContent = String(duration.minutes).padStart(2, "0");
  document.getElementById("heroSeconds").textContent = String(duration.seconds).padStart(2, "0");
}

function updateOverview(states, now) {
  const nextOpen = states
    .filter(state => state.eventType === "open" && state.target > now)
    .sort((a, b) => a.target - b.target)[0];

  const nextClose = states
    .filter(state => ["close", "pause"].includes(state.eventType) && state.target > now)
    .sort((a, b) => a.target - b.target)[0];

  document.getElementById("nextOpenSummary").textContent = nextOpen
    ? `${nextOpen.market.seal} · ${formatDuration(nextOpen.target - now, true)}`
    : "—";

  document.getElementById("nextCloseSummary").textContent = nextClose
    ? `${nextClose.market.seal} · ${formatDuration(nextClose.target - now, true)}`
    : "—";
}

function tick() {
  const now = new Date();
  updateWorldClocks(now);
  const states = updateMarketCards(now);
  const nextEvent = selectNextEvent(states, now);
  updateHero(nextEvent, now);
  updateOverview(states, now);
}

createMarketCards();
tick();
setInterval(tick, SECOND_MS);
