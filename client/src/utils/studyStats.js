export function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("acely_user") || "null"
    );
  } catch {
    return null;
  }
}

export function getAccountKey() {
  const user = getStoredUser();

  return (
    user?.email ||
    user?.userId ||
    "guest"
  )
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_");
}

export function getQuizAttempts() {
  const key = `acely_quiz_attempts_${getAccountKey()}`;

  try {
    const attempts = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(attempts)
      ? attempts
      : [];
  } catch {
    return [];
  }
}

export function saveQuizAttempt(attempt) {
  const key = `acely_quiz_attempts_${getAccountKey()}`;

  const attempts = getQuizAttempts();

  attempts.unshift(attempt);

  localStorage.setItem(
    key,
    JSON.stringify(attempts.slice(0, 100))
  );
}

export function getStudyHours(attempts) {
  const milliseconds = attempts.reduce(
    (total, attempt) =>
      total + Number(attempt.durationMs || 0),
    0
  );

  return milliseconds / 1000 / 60 / 60;
}

export function getQuizAccuracy(attempts) {
  if (!attempts.length) {
    return 0;
  }

  const totalQuestions = attempts.reduce(
    (total, attempt) =>
      total + Number(attempt.total || 0),
    0
  );

  const totalCorrect = attempts.reduce(
    (total, attempt) =>
      total + Number(attempt.score || 0),
    0
  );

  if (!totalQuestions) {
    return 0;
  }

  return Math.round(
    (totalCorrect / totalQuestions) * 100
  );
}

export function getCompletedQuizCount(attempts) {
  return attempts.length;
}

function localDateKey(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getStudyStreak(attempts) {
  if (!attempts.length) {
    return 0;
  }

  const dates = [
    ...new Set(
      attempts
        .map((attempt) =>
          localDateKey(
            attempt.completedAt
          )
        )
        .filter(Boolean)
    ),
  ].sort().reverse();

  if (!dates.length) {
    return 0;
  }

  const today = new Date();

  const todayKey = localDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const yesterdayKey =
    localDateKey(yesterday);

  if (
    dates[0] !== todayKey &&
    dates[0] !== yesterdayKey
  ) {
    return 0;
  }

  let streak = 1;

  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(
      `${dates[i]}T00:00:00`
    );

    const previous = new Date(
      `${dates[i + 1]}T00:00:00`
    );

    const difference =
      Math.round(
        (current - previous) /
          (1000 * 60 * 60 * 24)
      );

    if (difference !== 1) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export function getSavedResources(documents) {
  return documents.reduce(
    (total, document) => {
      return (
        total +
        Number(Boolean(document.notesAvailable)) +
        Number(
          Boolean(document.flashcardsAvailable)
        ) +
        Number(
          Boolean(document.mindMapAvailable)
        ) +
        Number(
          Boolean(document.quizAvailable)
        )
      );
    },
    0
  );
}

export function getResourceProgress(documents) {
  if (!documents.length) {
    return 0;
  }

  const generated = getSavedResources(
    documents
  );

  const total = documents.length * 4;

  return Math.round(
    (generated / total) * 100
  );
}