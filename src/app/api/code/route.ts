import { NextRequest, NextResponse } from "next/server";

const allCodeToData = new Map<string, any>();

export async function POST(request: NextRequest) {
    const { code, data } = await request.json();
    allCodeToData.set(code, data);
    return new Response("Code stored");
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    
    console.log("Received code:", code, "Type:", typeof code);
    console.log("Available codes in map:", Array.from(allCodeToData.keys()));
    console.log("Map has this code:", allCodeToData.has(code || ""));
    
    if (code && allCodeToData.has(code)) {
        return NextResponse.json(allCodeToData.get(code));
    } else {
        return new Response("Code not found", { status: 404 });
    }
}