## Stack

- Expo SDK 54 + Expo Router
- NativeWind v4 + Tailwind CSS v3
- Convex
- React Hook Form + Zod
- Bun como package manager

## Primer arranque

```bash
bun install
bun run start
```

## Convex

1. Crea tu archivo `.env` a partir de `.env.example`.
2. Inicializa Convex:

```bash
bunx convex dev
```

Mientras `EXPO_PUBLIC_CONVEX_URL` no exista, la app levanta sin conectar Convex.

## Estructura útil

- `app/`: rutas de Expo Router
- `components/providers/`: providers globales
- `global.css`: entrada de NativeWind
- `tailwind.config.js`: tokens base del design system

## Comandos

```bash
bun run start
bun run android
bun run ios
bun run web
bun run lint
bun run typecheck
```
