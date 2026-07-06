export const availabilityOptions = [
  "Disponible en 24h",
  "Disponible en précommande 7-10 jours ouvrés",
  "Disponible en précommande 30-45 jours",
];

const legacyPreorderAvailability = "Disponible en précommande";
const legacyLongPreorderAvailability = "Disponible en précommande 30 jours";
const availabilitySeparator = "||";

export function normalizeAvailabilityStatus(status?: string | null) {
  if (status === legacyPreorderAvailability) return availabilityOptions[1];
  if (status === legacyLongPreorderAvailability) return availabilityOptions[2];
  if (status && availabilityOptions.includes(status)) return status;

  return availabilityOptions[0];
}

export function parseAvailabilityStatuses(availabilityStatus?: string | null) {
  const values = (availabilityStatus || "")
    .split(availabilitySeparator)
    .map((status) => normalizeAvailabilityStatus(status.trim()))
    .filter(Boolean);

  const uniqueValues = Array.from(new Set(values));
  return uniqueValues.length > 0 ? uniqueValues : [availabilityOptions[0]];
}

export function encodeAvailabilityStatuses(statuses: string[]) {
  const validStatuses = statuses
    .map((status) => normalizeAvailabilityStatus(status))
    .filter((status, index, list) => list.indexOf(status) === index);

  return (validStatuses.length > 0 ? validStatuses : [availabilityOptions[0]]).join(
    availabilitySeparator,
  );
}

export function getProductAvailabilityLabel(availabilityStatus?: string | null) {
  return parseAvailabilityStatuses(availabilityStatus).join(" / ");
}

export function getProductAvailabilityShortLabel(
  availabilityStatus?: string | null,
) {
  const statuses = parseAvailabilityStatuses(availabilityStatus);

  if (statuses.length > 1) return "Plusieurs délais";
  if (statuses[0] === availabilityOptions[0]) return "Dispo 24h";
  if (statuses[0] === availabilityOptions[1]) return "Préco 7-10 j";
  if (statuses[0] === availabilityOptions[2]) return "Préco 30-45 j";

  return "Disponible";
}

export function getProductAvailabilityBadgeLabels(
  availabilityStatus?: string | null,
) {
  return parseAvailabilityStatuses(availabilityStatus).map((status) => {
    if (status === availabilityOptions[1]) {
      return "Précommande 7-10 jours ouvrés";
    }

    if (status === availabilityOptions[2]) {
      return "Précommande 30-45 jours";
    }

    return status;
  });
}

export function getLongestAvailabilityStatus(statuses: string[]) {
  const normalizedStatuses = statuses.map((status) =>
    normalizeAvailabilityStatus(status),
  );

  if (normalizedStatuses.includes(availabilityOptions[2])) {
    return availabilityOptions[2];
  }

  if (normalizedStatuses.includes(availabilityOptions[1])) {
    return availabilityOptions[1];
  }

  return availabilityOptions[0];
}
