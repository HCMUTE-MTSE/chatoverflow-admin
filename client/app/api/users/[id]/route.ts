import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const apiUrl = `${API_BASE_URL}/users/${id}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 cần Promise ở đây
) {
  try {
    // ✅ Bắt buộc phải await params trong Next.js 15+
    const { id } = await params;
    const body = await request.json();

    const apiUrl = `${API_BASE_URL}/users/${id}`;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(
        "Failed to update user:",
        response.status,
        await response.text()
      );
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("🔥 User update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const apiUrl = `${API_BASE_URL}/users/${id}`;

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User delete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
