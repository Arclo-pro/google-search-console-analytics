import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const googleConnections = pgTable("google_connections", {
  websiteId: text("website_id").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiryDate: integer("expiry_date").notNull(), // Unix timestamp in ms
  scopes: text("scopes").array().notNull(),
  scProperty: text("sc_property"),
  ga4PropertyId: text("ga4_property_id"),
  googleUserEmail: text("google_user_email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGoogleConnectionSchema = createInsertSchema(googleConnections).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertGoogleConnection = z.infer<typeof insertGoogleConnectionSchema>;
export type GoogleConnection = typeof googleConnections.$inferSelect;
