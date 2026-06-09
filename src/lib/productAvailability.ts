export const availabilityOptions = [
  "Disponible en 24h",
  "Disponible en précommande",
];

export function getProductAvailabilityLabel(availabilityStatus?: string | null) {
  if (availabilityStatus && availabilityOptions.includes(availabilityStatus)) {
    return availabilityStatus;
  }

  return availabilityOptions[0];
}
