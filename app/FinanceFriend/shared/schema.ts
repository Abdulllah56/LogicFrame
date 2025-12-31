import { pgTable, text, serial, integer, boolean, date, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
});

// Categories for expenses
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
  icon: true,
});

// Expenses model
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  currency: text("currency").notNull().default("USD"),
});

// Use a custom schema with proper date handling
export const insertExpenseSchema = z.object({
  userId: z.number(),
  amount: z.number(),
  // Parse ISO date strings into Date objects
  date: z.string().transform(val => new Date(val)),
  description: z.string().optional(),
  categoryId: z.number(),
  currency: z.string(),
});

// Bills model
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  amount: doublePrecision("amount").notNull(),
  dueDate: date("due_date").notNull(),
  isPaid: boolean("is_paid").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringPeriod: text("recurring_period"), // monthly, weekly, etc.
});

export const insertBillSchema = createInsertSchema(bills).pick({
  userId: true,
  name: true,
  amount: true,
  dueDate: true,
  isPaid: true,
  isRecurring: true,
  recurringPeriod: true,
});

// Savings Goals model
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: doublePrecision("target_amount").notNull(),
  currentAmount: doublePrecision("current_amount").default(0),
  targetDate: date("target_date"),
  icon: text("icon"),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).pick({
  userId: true,
  name: true,
  targetAmount: true,
  currentAmount: true,
  targetDate: true,
  icon: true,
});

// Budget model
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id"), // Optional - if null, it's the overall budget
  amount: doublePrecision("amount").notNull(),
  period: text("period").notNull(), // monthly, weekly, etc.
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  categoryId: true,
  amount: true,
  period: true,
});

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
