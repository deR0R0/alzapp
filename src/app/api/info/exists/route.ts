import { NextRequest, NextResponse } from "next/server";
import { allCodeToData } from "@/lib/store";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!allCodeToData.has(code || "")) {
        return new Response("Code doesn't exist", { status: 404 });
    } else {
        return new Response("Code exists");
    }
}