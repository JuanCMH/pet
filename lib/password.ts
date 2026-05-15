export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_HELPER_TEXT =
  "Mínimo 8 caracteres, debe incluir una mayúscula, una minúscula y un número.";

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (!/[a-z]/.test(password)) {
    return "La contraseña debe incluir al menos una letra minúscula.";
  }
  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe incluir al menos una letra mayúscula.";
  }
  if (!/\d/.test(password)) {
    return "La contraseña debe incluir al menos un número.";
  }
  return null;
}
