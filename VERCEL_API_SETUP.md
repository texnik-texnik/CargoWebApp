# Настройка Vercel API Token для полных логов деплоя

## 1. Создайте Vercel API Token

1. Перейдите на https://vercel.com/account/tokens
2. Нажмите **Create Token**
3. Дайте название: `GitHub Actions CI/CD`
4. Scope: выберите ваш аккаунт или team
5. Нажмите **Create**
6. **Скопируйте токен** (он показывается только один раз!)

## 2. Найдите Project ID и Team ID

### Project ID:
1. Перейдите в проект на Vercel
2. URL будет выглядеть так: `https://vercel.com/<team-name>/<project-name>/settings`
3. Или через API:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v9/projects
   ```
4. Найдите ваш проект и скопируйте `id` (формат: `prj_xxxxxxxxxxxx`)

### Team ID:
1. Перейдите в Settings → Team → General
2. Team ID отображается в URL или в настройках
3. Или через API:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v2/teams
   ```
4. Скопируйте `id` (формат: `team_xxxxxxxxxxxx`)

## 3. Добавьте Secrets в GitHub

Перейдите в ваш репозиторий на GitHub:
`Settings → Secrets and variables → Actions → New repository secret`

Добавьте три секрета:

| Secret Name | Value |
|---|---|
| `VERCEL_TOKEN` | Ваш Vercel API Token |
| `VERCEL_PROJECT_ID` | ID проекта (например: `prj_abc123...`) |
| `VERCEL_TEAM_ID` | ID команды (например: `team_xyz789...`) |

## 4. Проверка работы

После добавления секретов:

1. Сделайте push на `main`
2. GitHub Actions запустит workflow
3. В комментарии к комменту вы увидите:
   - ✅ Статус деплоя
   - 🌐 URL сайта
   - 📊 Полные логи сборки (в артефактах)

## 5. Где найти логи

После завершения workflow:
1. Откройте Actions → последний workflow run
2. Внизу страницы есть секция **Artifacts**
3. Скачайте `vercel-deploy-logs`
4. Внутри будет markdown файл с полными логами

---

## Альтернатива: Без API Token

Если не хотите создавать API Token, workflow будет работать в **простом режиме**:
- ✅ Проверяет доступность сайта
- ✅ Комментирует коммит со статусом
- ❌ Без полных логов сборки
