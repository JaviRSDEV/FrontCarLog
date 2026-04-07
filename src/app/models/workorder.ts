import { Workshop } from './workshop';
import { Vehicle } from './vehicle';
import { User } from './user';
import { WorkOrderLine } from './workorderline';

export interface Workorder {
  id: number;
  description?: string;
  mechanicNotes?: string;
  status: string;
  createdAt?: string;
  closedAt?: string;
  vehicle: Vehicle;
  mechanic: User;
  workshop: Workshop;
  totalAmount: number;
  lines?: WorkOrderLine[];
}
