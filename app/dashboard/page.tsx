import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ExtendedUser } from "@/lib/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as ExtendedUser | undefined;
  const orgId = user?.organizationId;

  const [facilities, totalUsers] = await Promise.all([
    prisma.facility.findMany({ where: { organizationId: orgId } }),
    prisma.user.count({ where: { organizationId: orgId } }),
  ]);

  const totalBeds = facilities.reduce((sum, f) => sum + f.totalBeds, 0);
  const totalOccupancy = facilities.reduce((sum, f) => sum + f.currentOccupancy, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((totalOccupancy / totalBeds) * 100) : 0;

  const stats = [
    { label: "Facilities", value: facilities.length, color: "bg-blue-500" },
    { label: "Total Beds", value: totalBeds, color: "bg-emerald-500" },
    { label: "Current Residents", value: totalOccupancy, color: "bg-violet-500" },
    { label: "Occupancy Rate", value: `${occupancyRate}%`, color: "bg-amber-500" },
    { label: "Staff Users", value: totalUsers, color: "bg-rose-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-sm text-slate-500">
          Here&apos;s an overview of your organization
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <div className={`mb-3 h-2 w-10 rounded-full ${stat.color}`} />
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Facilities Table */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Facilities</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Address</th>
                <th className="pb-3 font-medium">Beds</th>
                <th className="pb-3 font-medium">Occupancy</th>
                <th className="pb-3 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facilities.map((facility) => {
                const rate = Math.round(
                  (facility.currentOccupancy / facility.totalBeds) * 100
                );
                return (
                  <tr key={facility.id} className="text-slate-700">
                    <td className="py-3 font-medium">{facility.name}</td>
                    <td className="py-3">{facility.address}</td>
                    <td className="py-3">{facility.totalBeds}</td>
                    <td className="py-3">{facility.currentOccupancy}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          rate >= 90
                            ? "bg-red-100 text-red-700"
                            : rate >= 70
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
