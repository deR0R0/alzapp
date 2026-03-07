// Use globalThis to persist data across hot reloads in development
// Note: For production, consider using a database like Redis or PostgreSQL

declare global {
    var _allCodeToData: Map<string, any> | undefined;
    var _codeToLocations: Map<string, { lat: number, lng: number }[]> | undefined;
}

export const allCodeToData: Map<string, any> = globalThis._allCodeToData ?? (globalThis._allCodeToData = new Map<string, any>());
export const codeToLocations: Map<string, { lat: number, lng: number }[]> = globalThis._codeToLocations ?? (globalThis._codeToLocations = new Map<string, { lat: number, lng: number }[]>());