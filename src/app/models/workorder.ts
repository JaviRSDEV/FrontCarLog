import { Workshop } from './workshop';
import { Vehicle } from './vehicle';
import { User } from './user';
import { WorkOrderLine } from './workorderline';

// Definimos los estados posibles para tener autocompletado total
export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Workorder {
  id: number;
  description?: string;
  mechanicNotes?: string;
  status: WorkOrderStatus;

  createdAt?: string;
  closedAt?: string;

  vehicle: Vehicle;
  mechanic: User;
  mechanicName?: string;

  workshop: Workshop;
  totalAmount: number;
  lines: WorkOrderLine[];
}

export interface CreateWorkOrderDto {
  description: string;
  vehiclePlate: string;
}

export interface UpdateWorkOrderDto {
  mechanicNotes?: string;
  status?: string;
}
