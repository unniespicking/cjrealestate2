import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth";

export async function GET() {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ staff: null }, { status: 200 });
  return NextResponse.json({
    staff: {
      slug: staff.slug,
      name: staff.name,
      role: staff.role,
      email: staff.email,
      office: staff.office,
      photo: staff.photo,
    },
  });
}
