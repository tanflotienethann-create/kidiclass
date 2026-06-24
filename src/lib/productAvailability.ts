export const availabilityOptions = [
  "Disponible en 24h",
  "Disponible en précommande 7-10 jours ouvrés",
  "Disponible en précommande 30 jours",
];

const legacyPreorderAvailability = "Disponible en précommande";

export function getProductAvailabilityLabel(availabilityStatus?: string | null) {
  if (availabilityStatus === legacyPreorderAvailability) {
    return availabilityOptions[1];
  }

  if (availabilityStatus && availabilityOptions.includes(availabilityStatus)) {
    return availabilityStatus;
  }

  return availabilityOptions[0];
}
