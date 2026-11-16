import type { ImagingEquipment } from "@/types/radiology";

export function formatEquipmentLocation(location: ImagingEquipment["location"]): string {
  return [location.building, `Floor ${location.floor}`, `Room ${location.room}`]
    .filter(Boolean)
    .join(", ");
}
