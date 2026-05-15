
export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
) {
  const diffMs = Math.max(0, now - timestamp);
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `hace ${weeks} sem`;

  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes`;

  const years = Math.floor(days / 365);
  return `hace ${years} año${years === 1 ? "" : "s"}`;
}
