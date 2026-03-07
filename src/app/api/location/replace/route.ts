import { NextRequest, NextResponse } from "next/server";
import { codeToLocations } from "@/lib/store";

export async function POST(request: NextRequest) {
    const { code, coords } = await request.json();
    console.log(`Received location for code ${code}: (${coords[0]}, ${coords[1]})`);
    if (!codeToLocations.has(code)) {
        codeToLocations.set(code, []);
    }
    codeToLocations.set(code, coords);
    return new Response("Location received");
}