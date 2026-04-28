import { WsSocket } from '@common/legacy/ws-noop';

export interface SocketUser {
  id: string;
  email: string;
  roles: string[];
  restaurant_id?: string;
}

export interface AuthenticatedSocket extends WsSocket {
  user?: SocketUser;
}
