import { NextRequest, NextResponse } from "next/server";
import { codeToLocations } from "@/lib/store";

export async function POST(request: NextRequest) {
    const { code, lat, lng } = await request.json();
    console.log(`Received location for code ${code}: (${lat}, ${lng})`);
    if (!codeToLocations.has(code)) {
        codeToLocations.set(code, []);
    }
    codeToLocations.get(code)?.push({ lat, lng });
    return new Response("Location received");
}

export { codeToLocations };