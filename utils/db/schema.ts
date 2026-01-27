
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tools Registry
export const tools = pgTable("tools", {
    id: serial("id").primaryKey(),
    slug: text("slug").unique().notNull(), // e.g. 'finance-friend', 'scope-creep'
    name: text("name").notNull(),
    description: text("description"),
});

// Plans for each tool
export const plans = pgTable("plans", {
    id: serial("id").primaryKey(),
    toolId: integer("tool_id").references(() => tools.id).notNull(),
    name: text("name").notNull(), // 'Free', 'Pro', 'Agency'
    price: integer("price").notNull(), // in cents
    paddlePriceId: text("paddle_price_id"), // Paddle Price ID
    features: jsonb("features"), // list of features
    isActive: boolean("is_active").default(true),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(), // References Supabase auth.users
    planId: integer("plan_id").references(() => plans.id),
    status: text("status").notNull(), // 'active', 'past_due', 'canceled', 'trialing'
    paddleSubscriptionId: text("paddle_subscription_id").unique(),
    currentPeriodEnd: timestamp("current_period_end"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const toolsRelations = relations(tools, ({ many }) => ({
    plans: many(plans),
}));

export const plansRelations = relations(plans, ({ one }) => ({
    tool: one(tools, {
        fields: [plans.toolId],
        references: [tools.id],
    }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    plan: one(plans, {
        fields: [subscriptions.planId],
        references: [plans.id],
    }),
}));
