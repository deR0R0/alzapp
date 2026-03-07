import { NextRequest, NextResponse } from "next/server";
import { allCodeToData } from "@/lib/store";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
        return new Response("Code is required", { status: 400 });
    }

    const data = allCodeToData.get(code);
    if (!data) {
        return new Response("Code not found", { status: 404 });
    }

    return NextResponse.json(data);
}