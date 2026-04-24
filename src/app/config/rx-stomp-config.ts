import { RxStompConfig } from '@stomp/rx-stomp';
import { environment } from '../../environments/environment.development';

export const myRxStompConfig: RxStompConfig = {
  brokerURL: environment.wsUrl,

  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,
  reconnectDelay: 200,

  debug: (msg: string): void => {
    console.log(new Date(), msg);
  },
};
