import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WebsocketModule } from './websocket/websocket.module';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [
    // Serve frontend static files from /public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    WebsocketModule,
    ProxyModule,
  ],
})
export class AppModule {}
