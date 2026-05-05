import { WebSocketAdapter, INestApplicationContext } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import * as sockjs from 'sockjs';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
import type { Server } from 'http';

/**
 * Custom NestJS WebSocket adapter that uses SockJS.
 * This allows the NestJS server to accept SockJS connections
 * from browsers (same protocol the Spring Boot backend uses).
 */
export class SockjsAdapter implements WebSocketAdapter {
  private sjsServer: sockjs.Server | null = null;

  constructor(private app: INestApplicationContext) {}

  create(port: number, options?: sockjs.ServerOptions): sockjs.Server {
    const sjsOptions: sockjs.ServerOptions = {
      prefix: '/ws',
      log: () => {},
      ...options,
    };
    this.sjsServer = sockjs.createServer(sjsOptions);
    return this.sjsServer;
  }

  bindClientConnect(server: sockjs.Server, callback: (conn: sockjs.Connection) => void): void {
    server.on('connection', (conn: sockjs.Connection) => {
      if (conn) {
        callback(conn);
      }
    });
  }

  bindClientDisconnect(client: sockjs.Connection, callback: () => void): void {
    client.on('close', callback);
  }

  bindMessageHandlers(
    client: sockjs.Connection,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): void {
    fromEvent<string>(client as any, 'data')
      .pipe(
        mergeMap((data: string) => this.bindMessageHandler(data, handlers, process)),
        filter((result: any) => result !== undefined && result !== null),
      )
      .subscribe((response: any) => {
        const responseStr = typeof response === 'object' ? JSON.stringify(response) : String(response);
        client.write(responseStr);
      });
  }

  bindMessageHandler(
    rawMessage: string,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    try {
      // Try to parse as STOMP frame
      const frame = this.parseStompFrame(rawMessage);
      if (frame) {
        const { command, headers, body } = frame;

        if (command === 'CONNECT') {
          return new Observable((observer) => {
            observer.next({ __stomp_command: 'CONNECTED', headers: { version: '1.1' }, body: '' });
            observer.complete();
          });
        }

        if (command === 'SUBSCRIBE') {
          // Subscriptions are handled in the gateway
          const handler = handlers.find((h) => h.message === '__subscribe');
          if (handler) {
            return process(handler.callback({ headers, body, command }));
          }
          return EMPTY;
        }

        if (command === 'SEND') {
          const destination = headers['destination'] || '';
          // Strip /app prefix to match handler patterns
          const pattern = destination.replace(/^\/app/, '');
          const handler = handlers.find((h) => h.message === pattern || h.message === destination);
          if (handler) {
            let payload: any = body;
            try {
              payload = JSON.parse(body);
            } catch {
              // keep as string
            }
            return process(handler.callback(payload, headers));
          }
        }

        if (command === 'DISCONNECT') {
          return EMPTY;
        }
      }
    } catch {
      // Not a STOMP frame, treat as raw JSON
    }

    // Fallback: try matching raw message as JSON to a default handler
    const defaultHandler = handlers.find((h) => h.message === '/chat' || h.message === 'message');
    if (defaultHandler) {
      let parsed: any = rawMessage;
      try {
        parsed = JSON.parse(rawMessage);
      } catch {
        // keep as string
      }
      return process(defaultHandler.callback(parsed));
    }

    return EMPTY;
  }

  close(server: sockjs.Server): void {
    // SockJS server doesn't have a direct close method
  }

  /**
   * Installs the SockJS server onto the HTTP server.
   * Called by NestJS during initialization.
   */
  bindToHttpServer(httpServer: Server, sjsServer: sockjs.Server): void {
    sjsServer.installHandlers(httpServer, { prefix: '/ws' });
  }

  // ─── STOMP Frame Parser ───

  private parseStompFrame(raw: string): { command: string; headers: Record<string, string>; body: string } | null {
    if (!raw || raw.trim().length === 0) return null;

    const lines = raw.split('\n');
    const command = lines[0]?.trim();
    if (!command || !['CONNECT', 'SEND', 'SUBSCRIBE', 'UNSUBSCRIBE', 'DISCONNECT', 'ACK', 'NACK', 'BEGIN', 'COMMIT', 'ABORT'].includes(command)) {
      return null;
    }

    const headers: Record<string, string> = {};
    let i = 1;
    for (; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line || line === '') break;
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        headers[line.substring(0, colonIdx)] = line.substring(colonIdx + 1);
      }
    }

    const body = lines
      .slice(i + 1)
      .join('\n')
      .replace(/\0$/, '')
      .trim();

    return { command, headers, body };
  }

  /**
   * Format a STOMP frame string to send to clients.
   */
  static formatStompFrame(command: string, headers: Record<string, string>, body: string): string {
    let frame = command + '\n';
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`;
    }
    frame += '\n' + body + '\0';
    return frame;
  }
}
