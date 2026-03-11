import { NextRequest, NextResponse } from "next/server";
import type { TeamMember } from "@/types";

// In-memory store (persists for duration of server process)
let members: TeamMember[] = [
  {
    id: "1",
    name: "Jose Espinosa",
    position: "Investor Relations",
    department: "Investor Relations",
    responsibilities: ["Create orders", "Allocate orders", "Investor support"],
    email: "jose@industryfintech.com",
    color: "purple",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Tomas Calle",
    position: "Operations Associate",
    department: "Operations",
    responsibilities: [
      "Form D Filing",
      "Blue sky management",
      "Statement generation",
      "Deal creation",
    ],
    email: "tomas@industryfintech.com",
    color: "teal",
    created_at: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");
  const filtered = department
    ? members.filter((m) => m.department === department)
    : members;
  return NextResponse.json({ data: filtered });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const member: TeamMember = {
    id: Date.now().toString(),
    name: body.name,
    position: body.position,
    department: body.department,
    responsibilities: body.responsibilities ?? [],
    email: body.email ?? "",
    color: body.color ?? "blue",
    created_at: new Date().toISOString(),
  };
  members.push(member);
  return NextResponse.json({ data: member }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  members[idx] = { ...members[idx], ...updates };
  return NextResponse.json({ data: members[idx] });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  members = members.filter((m) => m.id !== id);
  return NextResponse.json({ message: "Deleted" });
}
