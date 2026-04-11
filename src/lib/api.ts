/**
 * Хелпер для fetch запросов с заголовком авторизации Telegram.
 * Автоматически добавляет X-Telegram-Id заголовок из localStorage.
 */

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function authenticatedFetch(url: string, options: FetchOptions = {}) {
  const { skipAuth, headers, ...restOptions } = options;

  // Получаем telegram_id из localStorage
  let telegramId: string | null = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      telegramId = user?.telegram_id;
    }
  } catch (e) {
    console.warn('Failed to get telegram_id from localStorage', e);
  }

  // Формируем заголовки
  const authHeaders: Record<string, string> = {};
  if (telegramId && !skipAuth) {
    authHeaders['X-Telegram-Id'] = telegramId;
  }

  // Если это JSON запрос (не FormData), добавляем Content-Type
  if (restOptions.body && !(restOptions.body instanceof FormData)) {
    authHeaders['Content-Type'] = 'application/json';
  }

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers: {
      ...authHeaders,
      ...headers,
    },
  };

  return fetch(url, fetchOptions);
}
