declare module 'lirc-client' {
  function lircClient(options: LircClientOptions): LircClientInstance;

  export interface LircClientOptions {
    path?: string;
    host?: string; // 127.0.0.1
    port?: number; // 8765
    autoconnect?: boolean; // true
    reconnect?: boolean; // true
    reconnect_delay?: number; // 5000
  }

  export interface LircClientInstance {
    on(event: 'connect', fn: () => void): void;

    on(event: 'receive', fn: (remote: string, button: string, repeat: number) => void): void;

    send(value: string): Promise<LircSendResponse>;

    sendOnce(remote: string, button: string, repeat?: number): Promise<LircSendResponse>;

    sendStart(remote: string, button: string): Promise<LircSendResponse>;

    sendStop(remote: string, button: string): Promise<LircSendResponse>;

    list(remote?: string): Promise<string[]>;

    version(): Promise<string[]>;

    connect(): Promise<LircSendResponse>;

    disconnect(): Promise<LircSendResponse>;
  }

  export interface LircSendResponse {

  }

  export default lircClient;
}
