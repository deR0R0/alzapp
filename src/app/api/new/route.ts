import { NextRequest, NextResponse } from "next/server";

/*
allCodeToData = {
    "123456": {
        "name": "John Doe",
        "age": 75,
        "medications": ["Aspirin", "Lisinopril"],
        "emergencyContact": {
            "name": "Jane Doe",
            "phone": "555-123-4567"
        },
        "bounds": {
            "topLeft": [number, number],
            "bottomRight": [number, number]
        }
    }
}
*/

const allCodeToData = new Map<string, any>();

export async function POST(request: NextRequest) {
    const { name } = await request.json();
    // gen new 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    allCodeToData.set(code, { name });
    return new Response(code);
}

export { allCodeToData };