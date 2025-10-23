import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const apiUrl = `${API_BASE_URL}/questions/answers/${id}/unhide`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to unhide answer:",
        response.status,
        await response.text()
      );
      return NextResponse.json(
        { error: "Failed to unhide answer" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Answer unhide API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
