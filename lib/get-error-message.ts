const KNOWN_MESSAGES: Array<{ test: RegExp; message: string }> = [
  {
    test: /invalidaccountid|account not found|no account found/i,
    message: "No existe una cuenta con este correo.",
  },
  {
    test: /invalidsecret|wrong password|invalid credentials/i,
    message: "Correo o contraseña incorrectos.",
  },
  {
    test: /invalidpassword|password.*(short|weak|length|requirements|too)/i,
    message:
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
  },
  {
    test: /accountalreadyexists|already exists|email.*taken|duplicate/i,
    message: "Ya existe una cuenta con este correo.",
  },
  {
    test: /invalidverificationcode|code.*(invalid|expired|incorrect)/i,
    message: "El código es inválido o expiró. Solicita uno nuevo.",
  },
  {
    test: /too many requests|rate limit/i,
    message: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  },
  {
    test: /invalid.*email|email.*invalid/i,
    message: "Ingresa un correo electrónico válido.",
  },
  {
    test: /network|fetch failed|failed to fetch|offline|timeout/i,
    message: "Sin conexión. Verifica tu internet e inténtalo de nuevo.",
  },
  {
    test: /unauthor|forbidden/i,
    message: "No tienes permiso para realizar esta acción.",
  },
];

function cleanConvexNoise(raw: string): string {
  let message = raw;
  message = message.replace(/^\[CONVEX[^\]]*\]\s*/i, "");
  message = message.replace(/^Server Error\s*/i, "");
  message = message.replace(/^Uncaught\s+\w*Error:\s*/i, "");
  message = message.replace(/^Error:\s*/i, "");
  message = message.split("\n")[0]?.trim() ?? message;
  message = message.replace(/\s+Called by client.*$/i, "").trim();
  return message;
}

export function getErrorMessage(error: unknown): string {
  const fallback = "Ocurrió un error inesperado. Inténtalo de nuevo.";

  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (!raw) return fallback;

  for (const { test, message } of KNOWN_MESSAGES) {
    if (test.test(raw)) return message;
  }

  const cleaned = cleanConvexNoise(raw);

  if (!cleaned || /^[A-Z][a-z]*Error$/.test(cleaned) || cleaned.length > 160) {
    return fallback;
  }

  return cleaned;
}
