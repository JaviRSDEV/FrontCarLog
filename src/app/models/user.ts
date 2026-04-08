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
  workShop?: string;
  vehicles: Vehicle[];

  password?: string;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  authorities: { authority: string }[];
  credentialsNonExpired: boolean;
  enabled: boolean;
  username: string;
}
