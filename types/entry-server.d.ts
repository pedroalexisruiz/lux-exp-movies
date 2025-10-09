declare module './dist/server/entry-server.js' {
    export function render(
        url: string,
        ctx?: any
    ): Promise<{ html: string; head?: string; initialState?: any }>;
}
