"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, Printer } from "lucide-react";

export function UnderwriterActions() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const handleDecision = (dec: "pending" | "approved" | "rejected") => {
    setStatus(dec);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xs font-bold text-slate-900">
          Underwriter Loan Decision
        </h3>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-3.5 h-3.5" /> Print Dossier
        </Button>
      </CardHeader>
      <CardBody className="p-5 space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Internal Credit Committee Notes:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add verification notes, collateral waiver notes, or term specifications..."
            className="w-full h-20 p-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-emerald-700 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700">
            Decision:{" "}
            <span className="font-extrabold capitalize text-slate-900">
              {status}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDecision("pending")}
              className={status === "pending" ? "border-amber-500 text-amber-700 font-bold" : ""}
            >
              <Clock className="w-3.5 h-3.5" /> In Review
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDecision("rejected")}
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDecision("approved")}
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve Loan
            </Button>
          </div>
        </div>
        {saved && (
          <p className="text-[11px] font-bold text-emerald-700 text-right">
            Decision saved to MFO audit log.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
