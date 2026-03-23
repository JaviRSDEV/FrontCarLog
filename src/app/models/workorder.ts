import { Vehicle } from "./vehicle";

export interface Workorder {
  id: number;
  description?: string;
  mechanicNotes?: string;
  status: string;
  totalAmount: number;
  vehicle: Vehicle;
}
