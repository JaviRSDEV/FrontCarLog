export interface User {
  dni: string;
  name: string;
  email: string;
  phone: string;
  role: 'MANAGER' | 'CLIENT';
  mustChangePsswd: boolean;
  workShopId: number | null;
  vehicles: any[];

  password?: string;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  authorities: { authority: string }[];
  credentialsNonExpired: boolean;
  enabled: boolean;
  username: string;
}
