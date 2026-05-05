import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Module({})
export class ProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Proxy all /api requests to the Spring Boot backend
    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:8080', // Your Spring Boot port
          changeOrigin: true,
          pathFilter: '/api',
        }),
      )
      .forRoutes('/api');
  }
}
