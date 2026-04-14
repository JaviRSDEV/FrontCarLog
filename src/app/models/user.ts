import { Vehicle } from './vehicle';

export interface User {
  dni: string;
  name: string;
  email: string;
  phone: string;
  token?: string;
  role: string;
  userId?: string;
  workShopId?: number;
  mustChangePsswd: boolean;

  workshop?: string | { workshopName: string };
  vehicles: Vehicle[];

  pendingWorkshop?: number;
  pendingWorkshopName?: string | null;
  pendingRole?: string | null;

  password?: string;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  authorities: { authority: string }[];
  credentialsNonExpired: boolean;
  enabled: boolean;
  username: string;
}
