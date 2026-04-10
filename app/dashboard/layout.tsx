import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDemoOrg } from "@/lib/demo";
import Sidebar from "@/components/Sidebar";
import DemoBadge from "@/components/DemoBadge";
import Providers from "@/components/Providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isDemo = isDemoOrg(session.user?.organizationName);

  return (
    <Providers>
      <div className="flex h-screen flex-col">
        {isDemo && <DemoBadge />}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-slate-50 p-8">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
}
