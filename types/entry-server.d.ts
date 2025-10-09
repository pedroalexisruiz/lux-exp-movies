declare module 'entry-server' {
  export function render(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx?: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ html: string; head?: string; initialState?: any }>;
}
