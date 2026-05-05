import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SockjsAdapter } from './websocket/sockjs.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the frontend can reach Spring Boot directly if needed
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Attach custom SockJS WebSocket adapter
  const sockjsAdapter = new SockjsAdapter(app);
  app.useWebSocketAdapter(sockjsAdapter);

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  console.log(`🚀 NestJS frontend server running on http://localhost:${port}`);
  console.log(`🔌 SockJS WebSocket available at http://localhost:${port}/ws`);
}
bootstrap();
