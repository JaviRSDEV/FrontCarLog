export interface User {
  dni: string;
  name: string;
  email: string;
  phone: string;
  token?: string;
  role: 'MANAGER' | 'CLIENT';
  UserDni?: number;
  workshopId?: number;
  mustChangePsswd: boolean;
  workShop?: string;
  vehicles: any[];

  password?: string;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  authorities: { authority: string }[];
  credentialsNonExpired: boolean;
  enabled: boolean;
  username: string;
}
