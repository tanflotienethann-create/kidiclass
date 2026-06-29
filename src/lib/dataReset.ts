export const DATA_RESET_AT = "2026-06-29T20:14:06.876Z";

export function isAfterDataReset(createdAt?: string | null) {
  if (!createdAt) return false;

  return new Date(createdAt).getTime() >= new Date(DATA_RESET_AT).getTime();
}
