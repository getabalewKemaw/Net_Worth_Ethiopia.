CREATE TABLE "staff_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"branch_id" text NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'sales' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "recorded_by_id" text;--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "recorded_by_name" text;--> statement-breakpoint
ALTER TABLE "sale" ADD COLUMN "recorded_by_id" text;--> statement-breakpoint
ALTER TABLE "sale" ADD COLUMN "recorded_by_name" text;--> statement-breakpoint
ALTER TABLE "staff_assignment" ADD CONSTRAINT "staff_assignment_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_assignment" ADD CONSTRAINT "staff_assignment_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_assignment" ADD CONSTRAINT "staff_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "staff_assignment_business_idx" ON "staff_assignment" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "staff_assignment_branch_idx" ON "staff_assignment" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "staff_assignment_email_idx" ON "staff_assignment" USING btree ("email");--> statement-breakpoint
CREATE INDEX "staff_assignment_user_idx" ON "staff_assignment" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_biz_email_unique_idx" ON "staff_assignment" USING btree ("business_id","email");--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_recorded_by_id_user_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_recorded_by_id_user_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_recorded_by_idx" ON "expense" USING btree ("recorded_by_id");--> statement-breakpoint
CREATE INDEX "sale_recorded_by_idx" ON "sale" USING btree ("recorded_by_id");