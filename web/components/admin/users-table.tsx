"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, UserX } from "lucide-react";
import type { UserRecord } from "@/types/admin";
import type { UserRole } from "@/types/auth";

interface UsersTableProps {
  initialUsers: UserRecord[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u
      )
    );
  };

  const roleBadgeVariants: Record<UserRole, "emerald" | "blue" | "amber" | "slate"> = {
    admin: "emerald",
    bank: "blue",
    merchant: "amber",
    sales: "slate",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-emerald-700 shadow-2xs font-medium"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs self-start">
          {["all", "merchant", "bank", "sales", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1 rounded-md capitalize font-bold transition-colors cursor-pointer ${
                selectedRole === r
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">User & Organization</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined Date</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-900">{u.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                  {u.businessName && <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">{u.businessName}</p>}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={roleBadgeVariants[u.role]}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${u.status === "active" ? "bg-emerald-600" : "bg-red-500"}`} />
                  <span className="capitalize font-semibold text-slate-800">{u.status}</span>
                </td>
                <td className="px-4 py-3 text-[11px] font-medium text-slate-500">{u.joinedAt}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" onClick={() => toggleStatus(u.id)}>
                    {u.status === "active" ? <UserX className="w-3.5 h-3.5 text-red-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-700" />}
                    <span>{u.status === "active" ? "Suspend" : "Activate"}</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
