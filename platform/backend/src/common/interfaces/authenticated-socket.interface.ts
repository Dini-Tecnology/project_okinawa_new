import { Socket } from 'socket.io';

export interface SocketUser {
  id: string;
  email: string;
  roles: string[];
  restaurant_id?: string;
}

export interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}
