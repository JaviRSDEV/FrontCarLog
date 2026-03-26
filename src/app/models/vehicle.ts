export interface Vehicle {
  id?: number;
  plate: string;
  brand: string;
  model: string;
  kilometers: number;
  engine: string;
  horsePower: number;
  torque: number;
  tires: string;
  images?: string[];
  lastMaintenance: string | null;
  workshopId?: number | null;
  ownerId?: string;
  pendingWorkshopId?: number | null;
}
