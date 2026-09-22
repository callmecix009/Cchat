ALTER TABLE "messages" ADD COLUMN "delivered" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "test_mode" boolean DEFAULT false NOT NULL;