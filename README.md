# Киносмотр — вебсайт с рецензиями на фильмы.

## Структура

- `client` — Vue 3 + Vite, публикация на Vercel
- `server` — Node.js + Express + MongoDB, публикация на Render
- `client/public/assets` — изображения, вырезанные из прототипа ЛР

## Локальный запуск

### 1. Сервер

```bash
cd server
npm install
cp .env.example .env
# В .env впишите MONGODB_URI и JWT_SECRET
npm start
```

Сервер: http://localhost:10000

Проверка: http://localhost:10000/

### 2. Клиент

В другом терминале:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Сайт: http://localhost:5173

## Переменные окружения

Server:

- `PORT` — порт Render/локального сервера
- `MONGODB_URI` — строка подключения Atlas
- `JWT_SECRET` — секрет для JWT
- `FRONTEND_URL` — адрес Vercel для CORS

Client:

- `VITE_API_URL` — URL опубликованного backend без `/` на конце

## Публикация

GitHub: один репозиторий с папками `client` и `server`.

Render:
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Variables: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`

Vercel:
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Variable: `VITE_API_URL`
