import dotenv from "dotenv";
dotenv.config();

import { db } from "../config/db";
import { user } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 NetWorth Database Setup: Ensuring Superadmin account...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin1g@gmail.com";
  console.log(`👤 Verifying Superadmin account: ${adminEmail}...`);

  const existingAdmin = await db.select().from(user).where(eq(user.email, adminEmail));
  if (existingAdmin.length === 0) {
    await db.insert(user).values({
      id: "usr_admin_1g",
      name: "Super Administrator",
      email: adminEmail,
      emailVerified: true,
      acceptedTerms: true,
    });
    console.log(`✅ Superadmin created with email: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Superadmin already verified: ${adminEmail}`);
  }

  console.log("🚀 Superadmin ready. Zero mock data policy enforced — all platform stats reflect real database records.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
