import { allCodeToData } from "@/lib/store";

export async function POST(request: Request) {
    const { code, data } = await request.json();
    allCodeToData.set(code, data);
    return new Response("Code stored");
}