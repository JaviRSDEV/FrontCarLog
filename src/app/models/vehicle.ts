import { Workshop } from './workshop';
export interface Vehicle {
  plate: string;
  brand: string;
  model: string;
  kilometers: string;
  engine: string;
  horsePower: number;
  torque: number;
  tires: string;
  image: string | null;
  lastMaintenance: string | null;
  workshopId: number | null;
  ownerId: string;
}
