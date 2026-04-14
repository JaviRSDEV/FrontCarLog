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

  workShop?: string | { workshopName: string };
  vehicles: Vehicle[];

  pendinWorkshop?: number;
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
