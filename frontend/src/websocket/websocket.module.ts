import { Module } from '@nestjs/common';
import { AppWebsocketGateway } from './websocket.gateway';

@Module({
  providers: [AppWebsocketGateway],
})
export class WebsocketModule {}
