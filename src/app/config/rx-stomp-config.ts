import { RxStompConfig } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { environment } from '../../environments/environment.development';

export const myRxStompConfig: RxStompConfig = {
  webSocketFactory: () => {
    return new SockJS(environment.wsUrl);
  },
  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,
  reconnectDelay: 200,

  debug: (msg: string): void => {
    console.log(new Date(), msg);
  },
};
