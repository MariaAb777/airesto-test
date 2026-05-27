# Airesto - https://airesto-test.vercel.app/

## Стек

- Vue 3 (Composition API)
- TypeScript

## Локальный запуск

```bash
cp .env.example .env
npm install
npm run dev
```

## Структура

```
src/
  api/           - запрос к API
  components/    - сетка, события, шапка
  composables/   - данные, тема, выбор, часы
  styles/        - CSS-переменные и сетка
  types/         - типы ответа API
  utils/         - время, раскладка событий
```
