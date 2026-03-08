import { codeToLocations } from "@/lib/store";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
        return new Response("Code is required", { status: 400 });
    }

    const locations = codeToLocations.get(code);
    if (!locations) {
        return new Response("Code not found", { status: 404 });
    }

    return new Response(JSON.stringify(locations), {
        headers: { "Content-Type": "application/json" },
    });
}