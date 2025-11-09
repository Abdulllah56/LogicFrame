// lib/db/schema.js
import { pgTable, text, serial, integer, boolean, date, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                 Users                                      */
/* -------------------------------------------------------------------------- */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
});

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  displayName: z.string().optional(),
  email: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/*                               Categories                                   */
/* -------------------------------------------------------------------------- */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
});

export const insertCategorySchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
});

/* -------------------------------------------------------------------------- */
/*                                Expenses                                    */
/* -------------------------------------------------------------------------- */
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
});

/* Zod schema that turns an ISO-date string into a Date object */
export const insertExpenseSchema = z.object({
  userId: z.number(),
  amount: z.number(),
  date: z.string().transform((val) => new Date(val)),
  description: z.string().optional(),
  categoryId: z.number(),
});

/* -------------------------------------------------------------------------- */
/*                                  Bills                                     */
/* -------------------------------------------------------------------------- */
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

export const insertBillSchema = z.object({
  userId: z.number(),
  name: z.string(),
  amount: z.number(),
  dueDate: z.coerce.date(), // automatically coerces string → Date
  isPaid: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/*                              Savings Goals                                 */
/* -------------------------------------------------------------------------- */
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: doublePrecision("target_amount").notNull(),
  currentAmount: doublePrecision("current_amount").default(0),
  targetDate: date("target_date"),
  icon: text("icon"),
});

export const insertSavingsGoalSchema = z.object({
  userId: z.number(),
  name: z.string(),
  targetAmount: z.number(),
  currentAmount: z.number().default(0),
  targetDate: z.coerce.date().optional(),
  icon: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/*                                 Budgets                                    */
/* -------------------------------------------------------------------------- */
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id"), // optional – null means overall budget
  amount: doublePrecision("amount").notNull(),
  period: text("period").notNull(), // monthly, weekly, etc.
});

export const insertBudgetSchema = z.object({
  userId: z.number(),
  categoryId: z.number().optional(),
  amount: z.number(),
  period: z.string(),
});

/* -------------------------------------------------------------------------- */
/*                         Inferred Types (optional)                          */
/* -------------------------------------------------------------------------- */
/* If you still need runtime types for Drizzle selects, you can keep these.   */
export const User = users.$inferSelect;
export const Category = categories.$inferSelect;
export const Expense = expenses.$inferSelect;
export const Bill = bills.$inferSelect;
export const SavingsGoal = savingsGoals.$inferSelect;
export const Budget = budgets.$inferSelect;

/* Insert-type helpers (runtime equivalents of the Zod schemas) */
export const InsertUser = insertUserSchema;
export const InsertCategory = insertCategorySchema;
export const InsertExpense = insertExpenseSchema;
export const InsertBill = insertBillSchema;
export const InsertSavingsGoal = insertSavingsGoalSchema;
export const InsertBudget = insertBudgetSchema;