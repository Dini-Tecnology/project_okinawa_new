type AnyDecoratorFactory = (...args: any[]) => any;

function noopDecorator(): any {
  return () => {
    return;
  };
}

export const SubscribeMessage: AnyDecoratorFactory = () => noopDecorator();
export const ConnectedSocket: AnyDecoratorFactory = () => noopDecorator();
export const MessageBody: AnyDecoratorFactory = () => noopDecorator();
export const WebSocketServer: AnyDecoratorFactory = () => noopDecorator();

export interface OnGatewayConnection {
  handleConnection?(client: any): void | Promise<void>;
}

export interface OnGatewayDisconnect {
  handleDisconnect?(client: any): void | Promise<void>;
}

export type WsServer = any;
export type WsSocket = any;
