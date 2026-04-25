import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/portal/login?next=/portal/staff");
  return <>{children}</>;
}
