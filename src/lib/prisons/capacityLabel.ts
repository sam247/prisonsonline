import type { Prison } from "@/types/prison";

/** Card label for capacity: closed/historic records show a former figure, not a current one. */
export function prisonCapacityLabel(prison: Pick<Prison, "status">): string {
  return prison.status === "closed" || prison.status === "historic" ? "Former capacity" : "Capacity";
}
