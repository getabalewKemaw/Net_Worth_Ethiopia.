"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, UserX, Store, MapPin } from "lucide-react";
import { useAdminStore } from "@/store/admin-store";
import type { UserRecord } from "@/types/admin";

interface UsersTableProps {
  initialUsers?: UserRecord[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const { users, isLoading, fetchUsers, toggleUserStatus } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const displayUsers = users.length > 0 ? users : initialUsers || [];

  const filtered = displayUsers.filter((u) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(term);
    const emailMatch = u.email?.toLowerCase().includes(term);
    const bizMatch =
      u.primaryBusiness?.toLowerCase().includes(term) ||
      u.businessName?.toLowerCase().includes(term);
    return nameMatch || emailMatch || bizMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search business owner, store, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-emerald-700 shadow-2xs font-medium"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold self-start sm:self-auto">
          Total Registered Merchants: <strong className="text-slate-900">{filtered.length}</strong>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Business Owner</th>
              <th className="px-4 py-3">Primary Enterprise</th>
              <th className="px-4 py-3">Branches</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Loading registered merchants from database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No business owners found matching &quot;{searchTerm}&quot;.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const storeName = u.primaryBusiness || u.businessName || "No business registered";
                const city = u.city || "Addis Ababa";
                const branches = u.totalBranches ?? u.branchCount ?? 0;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{storeName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {city}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="slate">
                        {branches} Branch{branches === 1 ? "" : "es"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.status === "active" ? "bg-emerald-600" : "bg-red-500"
                          }`}
                        />
                        <span className="capitalize font-semibold text-slate-800">
                          {u.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-medium text-slate-500">
                      {u.createdAt || u.joinedAt || "Recent"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(u.id)}
                      >
                        {u.status === "active" ? (
                          <UserX className="w-3.5 h-3.5 text-red-600" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        )}
                        <span>{u.status === "active" ? "Suspend" : "Activate"}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
