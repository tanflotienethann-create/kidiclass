import { availabilityOptions, normalizeAvailabilityStatus } from "./productAvailability";

const availabilityMarker = "||KIDI_AVAILABILITY||";

export type ParsedOrderItemSelection = {
  selectedSize: string;
  availability: string;
};

export type OrderItemWithSelection = {
  id: number;
  quantity: number;
  selected_size: string | null;
  unit_price: number;
  products?: {
    name?: string | null;
    image_url?: string | null;
  } | null;
};

export type OrderShipmentGroup<T extends OrderItemWithSelection> = {
  availability: string;
  items: T[];
  itemsTotal: number;
  itemsCount: number;
};

export function encodeOrderItemSelection(
  selectedSize: string | null | undefined,
  availability: string | null | undefined,
) {
  const cleanSize = (selectedSize || "").trim();
  const cleanAvailability = normalizeAvailabilityStatus(availability);

  return `${cleanSize}${availabilityMarker}${cleanAvailability}`;
}

export function parseOrderItemSelection(
  selectedSize: string | null | undefined,
): ParsedOrderItemSelection {
  const value = selectedSize || "";

  if (!value.includes(availabilityMarker)) {
    return {
      selectedSize: value,
      availability: "",
    };
  }

  const [rawSize, rawAvailability] = value.split(availabilityMarker);

  return {
    selectedSize: (rawSize || "").trim(),
    availability: normalizeAvailabilityStatus(rawAvailability),
  };
}

export function buildOrderShipmentGroups<T extends OrderItemWithSelection>(
  items: T[],
) {
  const groups = new Map<string, OrderShipmentGroup<T>>();

  items.forEach((item) => {
    const selection = parseOrderItemSelection(item.selected_size);
    const availability = selection.availability || "Délai non précisé";
    const currentGroup =
      groups.get(availability) ||
      ({
        availability,
        items: [],
        itemsTotal: 0,
        itemsCount: 0,
      } satisfies OrderShipmentGroup<T>);

    currentGroup.items.push(item);
    currentGroup.itemsTotal += Number(item.unit_price || 0) * Number(item.quantity || 0);
    currentGroup.itemsCount += Number(item.quantity || 0);
    groups.set(availability, currentGroup);
  });

  return Array.from(groups.values()).sort((first, second) => {
    const firstIndex = availabilityOptions.indexOf(first.availability);
    const secondIndex = availabilityOptions.indexOf(second.availability);

    if (firstIndex === -1 && secondIndex === -1) {
      return first.availability.localeCompare(second.availability);
    }

    if (firstIndex === -1) return 1;
    if (secondIndex === -1) return -1;

    return firstIndex - secondIndex;
  });
}
