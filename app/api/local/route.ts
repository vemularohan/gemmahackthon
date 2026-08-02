import { NextRequest, NextResponse } from "next/server";
import {
  districtSupportData,
  emergencyContacts,
  findDistrictContext,
} from "@/lib/local/local-context";

export async function GET(request: NextRequest) {
  const district = request.nextUrl.searchParams.get("district");
  if (!district) {
    return NextResponse.json({
      districts: districtSupportData.map((item) => ({
        district: item.district,
        state: item.state,
      })),
      emergencyContacts,
    });
  }

  const details = findDistrictContext(district);
  if (!details) {
    return NextResponse.json({ error: "District not found" }, { status: 404 });
  }

  return NextResponse.json({
    details,
    emergencyContacts,
  });
}
