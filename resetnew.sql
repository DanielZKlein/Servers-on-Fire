BEGIN;
DROP TABLE "sof_main_issue";
DROP TABLE "sof_main_category";
DROP TABLE "sof_main_message";
CREATE TABLE "sof_main_message" (
    "id" integer NOT NULL PRIMARY KEY,
    "english" text NOT NULL,
    "french" text NOT NULL,
    "german" text NOT NULL,
    "spanish" text NOT NULL,
    "polish" text NOT NULL,
    "korean" text NOT NULL,
    "romanian" text NOT NULL,
    "greek" text NOT NULL
)
;
CREATE TABLE "sof_main_category" (
    "id" integer NOT NULL PRIMARY KEY,
    "name_id" integer NOT NULL REFERENCES "sof_main_message" ("id")
)
;
CREATE TABLE "sof_main_issue" (
    "id" integer NOT NULL PRIMARY KEY,
    "name_id" integer NOT NULL REFERENCES "sof_main_message" ("id"),
    "long_id" integer NOT NULL REFERENCES "sof_main_message" ("id"),
    "short_id" integer NOT NULL REFERENCES "sof_main_message" ("id"),
    "category_id" integer NOT NULL REFERENCES "sof_main_category" ("id")
)
;
CREATE INDEX "sof_main_category_632e075f" ON "sof_main_category" ("name_id");
CREATE INDEX "sof_main_issue_632e075f" ON "sof_main_issue" ("name_id");
CREATE INDEX "sof_main_issue_5e74090a" ON "sof_main_issue" ("long_id");
CREATE INDEX "sof_main_issue_16bd836b" ON "sof_main_issue" ("short_id");
CREATE INDEX "sof_main_issue_42dc49bc" ON "sof_main_issue" ("category_id");
COMMIT;
