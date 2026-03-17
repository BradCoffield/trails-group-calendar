CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"all_day" boolean DEFAULT false,
	"description" text,
	"location" text,
	"submitted_by_user_id" text NOT NULL,
	"submitted_by_name" text NOT NULL,
	"submitted_by_org" text,
	"color" text DEFAULT '#1a73e8',
	"approved" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
