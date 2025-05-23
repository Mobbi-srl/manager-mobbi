
import { Area } from "@/hooks/area/types";

export interface UserAreaUpdateParams {
  userId: string;
  areaIds: string[];
}

export interface UserAreaUpdateResult {
  success: boolean;
  message?: string;
  areaIds?: string[];
}
