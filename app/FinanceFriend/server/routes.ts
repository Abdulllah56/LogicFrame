import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertExpenseSchema,
  insertBillSchema,
  insertSavingsGoalSchema,
  insertBudgetSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo user ID (in a real app this would come from auth)
  const DEMO_USER_ID = 1;

  // Create a demo user if it doesn't exist
  // const existingUser = await storage.getUserByUsername("demo");
  // if (!existingUser) {
  //   await storage.createUser({
  //     username: "demo",
  //     password: "password", // In a real app, this would be hashed
  //     displayName: "Jamie Smith",
  //     email: "demo@example.com"
  //   });
  // }

  // Categories Endpoints
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Expenses Endpoints
  app.get("/api/expenses", async (req, res) => {
    const expenses = await storage.getExpenses(DEMO_USER_ID);
    res.json(expenses);
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = { ...req.body, userId: DEMO_USER_ID };
      const validatedData = insertExpenseSchema.parse(expenseData);
      const newExpense = await storage.createExpense(validatedData);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expenseData = req.body;
      const updatedExpense = await storage.updateExpense(id, expenseData);

      if (!updatedExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json(updatedExpense);
    } catch (error) {
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);

      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Date range query for expenses
  app.get("/api/expenses/range", async (req, res) => {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      const expenses = await storage.getExpensesByDateRange(
        DEMO_USER_ID,
        startDate,
        endDate
      );

      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  // Bills Endpoints
  app.get("/api/bills", async (req, res) => {
    const bills = await storage.getBills(DEMO_USER_ID);
    res.json(bills);
  });

  app.get("/api/bills/due", async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const dueBills = await storage.getBillsDue(DEMO_USER_ID, days);
    res.json(dueBills);
  });

  app.post("/api/bills", async (req, res) => {
    try {
      const billData = { ...req.body, userId: DEMO_USER_ID };
      const validatedData = insertBillSchema.parse(billData);
      const newBill = await storage.createBill(validatedData);
      res.status(201).json(newBill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bill" });
      }
    }
  });

  app.put("/api/bills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const billData = req.body;
      const updatedBill = await storage.updateBill(id, billData);

      if (!updatedBill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json(updatedBill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update bill" });
    }
  });

  app.put("/api/bills/:id/pay", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedBill = await storage.markBillAsPaid(id);

      if (!updatedBill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json(updatedBill);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark bill as paid" });
    }
  });

  app.delete("/api/bills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBill(id);

      if (!success) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bill" });
    }
  });

  // Savings Goals Endpoints
  app.get("/api/goals", async (req, res) => {
    const goals = await storage.getSavingsGoals(DEMO_USER_ID);
    res.json(goals);
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = { ...req.body, userId: DEMO_USER_ID };
      const validatedData = insertSavingsGoalSchema.parse(goalData);
      const newGoal = await storage.createSavingsGoal(validatedData);
      res.status(201).json(newGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create savings goal" });
      }
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goalData = req.body;
      const updatedGoal = await storage.updateSavingsGoal(id, goalData);

      if (!updatedGoal) {
        return res.status(404).json({ message: "Savings goal not found" });
      }

      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update savings goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSavingsGoal(id);

      if (!success) {
        return res.status(404).json({ message: "Savings goal not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete savings goal" });
    }
  });

  // Budget Endpoints
  app.get("/api/budgets", async (req, res) => {
    const budgets = await storage.getBudgets(DEMO_USER_ID);
    res.json(budgets);
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const budgetData = { ...req.body, userId: DEMO_USER_ID };
      const validatedData = insertBudgetSchema.parse(budgetData);
      const newBudget = await storage.createBudget(validatedData);
      res.status(201).json(newBudget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create budget" });
      }
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const budgetData = req.body;
      const updatedBudget = await storage.updateBudget(id, budgetData);

      if (!updatedBudget) {
        return res.status(404).json({ message: "Budget not found" });
      }

      res.json(updatedBudget);
    } catch (error) {
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBudget(id);

      if (!success) {
        return res.status(404).json({ message: "Budget not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Dashboard Summary Endpoint
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const summary = await storage.getDashboardSummary(DEMO_USER_ID);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // Ensure in-memory storage has default seed data (including categories)
  await storage.initializeDefaults();

  const httpServer = createServer(app);
  return httpServer;
}
