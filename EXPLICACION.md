# Cómo está construido Pets

Este documento es una guía rápida para que el equipo entienda cómo está armado el
proyecto y pueda explicarlo. No entra en detalles muy técnicos: lo importante es
saber **qué hay**, **dónde está** y **cómo se comunican las piezas**.

---

## 1. ¿Qué es Pets?

Pets es una aplicación para cuidar mascotas. Permite:

- Registrar mascotas y consultar su información (peso, especie, dispositivos, etc.).
- Administrar medicamentos (crear, editar, recordar tomas).
- Ver un mapa con veterinarias cercanas.
- Participar en un foro entre dueños y expertos.
- Manejar autenticación (registro, login, recuperación de contraseña).

La app funciona en **Android, iOS y Web** desde un mismo código.

---

## 2. Stack en una frase

> Una app **Expo + React Native** con **TypeScript**, estilizada con **Tailwind**
> (NativeWind), navegada con **Expo Router** y conectada a un backend
> **Convex** que actúa como base de datos en tiempo real, API y autenticación.

---

## 3. Estructura del proyecto

```
pets/
├── app/              ← Pantallas (lo que el usuario ve)
├── components/       ← Piezas visuales reutilizables (botones, cards, etc.)
├── convex/           ← Backend: base de datos, queries, mutations, auth
├── hooks/            ← Lógica reutilizable (fetch, mutate, etc.)
├── lib/              ← Utilidades (formatos, helpers)
├── constants/        ← Colores y valores fijos del tema
├── assets/           ← Imágenes
├── app.json          ← Config de Expo
├── tailwind.config.js← Config de estilos
└── vercel.json       ← Config para desplegar la web a Vercel
```

### `app/` — las pantallas

Cada archivo dentro de `app/` es **una ruta**. Si el archivo se llama
`login.tsx`, existe la pantalla `/login`. Esto se llama *file-based routing* y lo
maneja **Expo Router**.

- `app/index.tsx` → pantalla inicial (splash / decisión de a dónde ir).
- `app/login.tsx`, `app/register.tsx`, `app/recover-password.tsx`,
  `app/new-password.tsx` → flujo de autenticación.
- `app/(tabs)/` → todo lo que está detrás del menú inferior (tabs).
  - `index.tsx` → Home / lista de mascotas.
  - `map.tsx` → Mapa de veterinarias.
  - `forum.tsx`, `forum-post.tsx` → Foro.
  - `medications.tsx`, `new-medication.tsx`, `edit-medication.tsx` → Medicamentos.
  - `pet-detail.tsx`, `pet-info.tsx`, `register-pet.tsx` → Detalle y registro
    de mascotas.
  - `profile.tsx`, `profile-password.tsx` → Perfil.
- `_layout.tsx` → define el “marco” común (providers, navegación) que envuelve
  a las pantallas hijas.

### `components/` — piezas reutilizables

- `components/system/` → la **librería visual interna**: botones, inputs,
  selects, cards, toasts, modales, mapas (`vets-map`, `pet-location-map`), etc.
  Aquí está casi todo lo que la app dibuja.
- `components/auth/` → componentes específicos para las pantallas de login/registro.
- `components/navigation/` → barra de tabs personalizada.
- `components/providers/` → envoltorios globales (proveedor de toasts, alertas
  de emergencia, providers de Convex/tema).

### `convex/` — el backend

Aquí vive **toda la lógica de servidor**. No usamos un servidor Express o
Next.js aparte: Convex hace ese papel. Ver detalle en la siguiente sección.

### `hooks/` y `lib/`

- `hooks/use-fetch.ts`, `hooks/use-mutate.ts`, `hooks/use-execute.ts` → atajos
  para hablar con Convex desde las pantallas con menos código repetido.
- `lib/` → utilidades puras: formatear fechas, mensajes de error, datos de
  veterinarias cercanas, etc.

---

## 4. El backend (Convex)

### ¿Qué es Convex?

Convex es un servicio que junta **base de datos + funciones de servidor + tiempo
real + autenticación** en un solo paquete. Lo importante:

- Las funciones que escribimos en `convex/*.ts` **se ejecutan en el servidor**,
  no en el dispositivo del usuario.
- El cliente se suscribe y los datos **se actualizan solos** cuando cambian
  (no hace falta hacer “refresh”).

### Archivos dentro de `convex/`

```
convex/
├── schema.ts           ← Definición de las tablas (la base de datos)
├── validators.ts       ← Tipos compartidos (enums) que se reusan en el schema
├── auth.ts             ← Configuración de login con email + contraseña
├── auth.config.ts      ← Datos del proveedor de auth
├── users.ts            ← Funciones del usuario actual y perfil
├── pets.ts             ← Crear/editar/listar mascotas y dueños
├── medications.ts      ← CRUD de medicamentos
├── medicationLogs.ts   ← Registro de tomas administradas
├── forumPosts.ts       ← Posts del foro
├── forumComments.ts    ← Comentarios del foro
├── upload.ts           ← URLs firmadas para subir imágenes
├── resend.ts           ← Envío de correos (OTP, recuperación)
├── http.ts             ← Rutas HTTP públicas (callbacks de auth, etc.)
└── lib/access.ts       ← Helpers de permisos (¿este usuario es dueño de esta mascota?)
```

### Las tablas (resumen)

Definidas en `convex/schema.ts`:

- **users**: perfil del usuario (nombre, email, avatar, documento, dirección).
- **pets**: la mascota (nombre, especie, sexo, fecha de nacimiento, foto,
  condición médica, id del collar).
- **petOwners**: relación entre usuario y mascota (rol: principal o secundario).
  Permite que varias personas administren la misma mascota.
- **medications** + **medicationLogs**: medicamento y cada vez que se administra
  o se omite.
- **forumPosts** + **forumComments**: foro.

### Dos tipos de funciones

Todo lo que el cliente puede llamar en Convex es una de estas:

| Tipo | Para qué se usa | Ejemplo |
|------|-----------------|---------|
| **query** | Leer datos | `api.pets.listMine` lista las mascotas del usuario |
| **mutation** | Escribir datos (crear/editar/borrar) | `api.medications.create` crea un medicamento |

Una `query` lee de la base de datos. Una `mutation` puede leer **y** modificar.
Ambas se ejecutan en el servidor de Convex.

### Autenticación

- Está en `convex/auth.ts` usando `@convex-dev/auth` con proveedor de
  contraseña.
- El email se envía con **Resend** (`convex/resend.ts`) para OTP y para resetear
  contraseña.
- Cuando un usuario entra, Convex crea un registro en la tabla `users` (lo hace
  `convex/lib/access.ts`).
- El cliente sabe si hay sesión a través del hook `useConvexAuth()`.

---

## 5. ¿Cómo se comunica el front con el back?

No hay “endpoints REST” en el sentido tradicional (no escribimos
`GET /api/pets`). En su lugar:

1. En el backend definimos una función, por ejemplo:

   ```ts
   // convex/pets.ts
   export const listMine = query({ ... });
   ```

2. Convex genera automáticamente un archivo de tipos (`convex/_generated/api.ts`)
   que expone esa función al cliente como `api.pets.listMine`.

3. En la pantalla, la usamos así:

   ```tsx
   import { api } from "@/convex/_generated/api";
   import { useQuery } from "convex/react";

   const pets = useQuery(api.pets.listMine);
   ```

   - `useQuery` **se suscribe**: si otro dispositivo cambia algo, la pantalla
     se actualiza sola.
   - Para escribir usamos `useMutation(api.medications.create)`.

4. Para no repetir patrones (loading, error, toast), tenemos los hooks propios
   en `hooks/`:

   - `use-fetch` → atajo de `useQuery`.
   - `use-mutate` → atajo de `useMutation` con manejo de errores.
   - `use-execute` → para acciones disparadas por el usuario.

**En resumen**: el front llama a funciones del back como si fueran funciones
locales con tipado, y Convex se encarga del transporte y la sincronización.

---

## 6. El front-end

### Cómo se ve

- **NativeWind** = Tailwind para React Native. Las clases (`className="bg-blanco
  rounded-component"`) funcionan igual que en web.
- **`global.css`** y **`tailwind.config.js`** definen colores y tokens del
  diseño (cobalto, celeste, blanco, gris, verde, amarillo, rojo, negro).
- **`components/system/`** es la “librería de UI” del proyecto: si necesitas un
  input, un select, un toast, un card, búscalo aquí antes de crear uno nuevo.

### Cómo se navega

- **Expo Router**: cada archivo en `app/` es una ruta.
- `_layout.tsx` define el envoltorio común (providers, navegación) para las
  rutas hijas.
- `app/(tabs)/_layout.tsx` configura las tabs inferiores.
- Para ir a otra pantalla:

  ```tsx
  import { useRouter } from "expo-router";
  const router = useRouter();
  router.push("/(tabs)/map");
  ```

### Formularios

Usamos **react-hook-form** con validaciones de **Zod**. Cada formulario:

1. Define un esquema (los campos y reglas).
2. Usa `useForm` para manejar valores y errores.
3. Al hacer submit, llama a la mutation de Convex.
4. Muestra un **toast** (`components/system/toast.tsx`) con el resultado.

### Estados (loading, error, vacío)

Todas las pantallas que cargan datos tienen tres estados visuales:

- Cargando → spinner.
- Vacío → mensaje informativo.
- Con datos → la lista o detalle.

---

## 7. ¿Cómo se ejecuta?

### Desarrollo

```bash
bun install          # Instalar dependencias
bun run start        # Abrir Expo (escaneas el QR en el móvil)
bun run web          # Abrir solo la versión web
```

Para el backend, en otra terminal:

```bash
bunx convex dev      # Levanta el servidor de Convex en desarrollo
```

### Producción

- **Móvil**: se publica con EAS Build (Expo Application Services).
- **Web**: se despliega a **Vercel**.
  - El archivo `vercel.json` ya está configurado.
  - Comando de build: `expo export -p web`.
  - La carpeta resultante es `dist/`.

---

## 8. Resumen para explicar en una reunión

1. **Una app, tres plataformas**: Android, iOS y web con el mismo código gracias
   a Expo + React Native.
2. **El back es Convex**: no hay servidor Express ni endpoints REST. Las
   pantallas llaman funciones (`query` para leer, `mutation` para escribir) y
   Convex se encarga de todo, incluida la sincronización en tiempo real.
3. **El front está organizado en**:
   - `app/` → pantallas (cada archivo es una ruta).
   - `components/` → piezas visuales reutilizables.
   - `hooks/` y `lib/` → utilidades.
4. **Estilo**: Tailwind (NativeWind) con un sistema de colores y componentes
   propio en `components/system/`.
5. **Auth**: email + contraseña con OTP por correo (Resend), todo manejado por
   Convex Auth.
6. **Despliegue web**: a Vercel con un solo comando.
