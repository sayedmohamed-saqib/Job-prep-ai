import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  settings: json("settings").$type<{
    expertise: string[];
    preparationMode: boolean;
    responseStyle: 'concise' | 'detailed';
  }>(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  transcript: text("transcript").notNull(),
  responses: json("responses").$type<{
    question: string;
    response: string;
    confidence: number;
  }[]>(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  settings: true,
});

export const insertInterviewSchema = createInsertSchema(interviews);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
