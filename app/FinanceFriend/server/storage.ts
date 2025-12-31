import {
  type User, type InsertUser, type Category, type InsertCategory,
  type Expense, type InsertExpense, type Bill, type InsertBill,
  type SavingsGoal, type InsertSavingsGoal, type Budget, type InsertBudget
} from "@shared/schema";

// Use global cache to persist across hot reloads in development
const GLOBAL_CACHE_KEY = 'financeFriendCache';
const GLOBAL_DATA_KEY = 'financeFriendData';

if (!(global as any)[GLOBAL_CACHE_KEY]) {
  (global as any)[GLOBAL_CACHE_KEY] = new Map<string, { ts: number; data: any }>();
}
const cache = (global as any)[GLOBAL_CACHE_KEY] as Map<string, { ts: number; data: any }>;

const CACHE_TTL = 60_000; // 60s cache

// Initialize global data store if not exists
if (!(global as any)[GLOBAL_DATA_KEY]) {
  (global as any)[GLOBAL_DATA_KEY] = {
    users: [],
    categories: [],
    expenses: [],
    bills: [],
    savingsGoals: [],
    budgets: [],
    ids: {
      users: 1,
      categories: 1,
      expenses: 1,
      bills: 1,
      goals: 1,
      budgets: 1
    }
  };
}

const getStore = () => (global as any)[GLOBAL_DATA_KEY];

export interface IStorage {
  // User Methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category Methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Expense Methods
  getExpenses(userId: number): Promise<Expense[]>;
  getExpensesByCategory(userId: number, categoryId: number): Promise<Expense[]>;
  getExpensesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;

  // Bill Methods
  getBills(userId: number): Promise<Bill[]>;
  getBillsDue(userId: number, days: number): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined>;
  markBillAsPaid(id: number): Promise<Bill | undefined>;
  deleteBill(id: number): Promise<boolean>;

  // Savings Goal Methods
  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined>;
  deleteSavingsGoal(id: number): Promise<boolean>;

  // Budget Methods
  getBudgets(userId: number): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;

  // Dashboard
  getDashboardSummary(userId: number): Promise<any>;

  // Initialize default data
  initializeDefaults(): Promise<void>;
}

// Database-backed storage implementation
class InMemoryStorage implements IStorage {

  async getUser(id: number): Promise<User | undefined> {
    return getStore().users.find((u: User) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return getStore().users.find((u: User) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const store = getStore();
    const user: User = { id: store.ids.users++, ...insertUser } as User;
    store.users.push(user);
    return user;
  }

  async getCategories(): Promise<Category[]> {
    const key = 'categories';
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
    const data = [...getStore().categories];
    cache.set(key, { ts: Date.now(), data });
    return data;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return getStore().categories.find((c: Category) => c.id === id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const store = getStore();
    const category: Category = { id: store.ids.categories++, ...insertCategory } as Category;
    store.categories.push(category);
    cache.delete('categories');
    return category;
  }

  async getExpenses(userId: number): Promise<Expense[]> {
    const key = `expenses:${userId}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

    const data = getStore().expenses
      .filter((e: Expense) => e.userId === userId)
      .sort((a: Expense, b: Expense) => (new Date(b.date).getTime()) - (new Date(a.date).getTime()));

    cache.set(key, { ts: Date.now(), data });
    return data;
  }

  async getExpensesByCategory(userId: number, categoryId: number): Promise<Expense[]> {
    return getStore().expenses.filter((e: Expense) => e.userId === userId && e.categoryId === categoryId);
  }

  async getExpensesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Expense[]> {
    return getStore().expenses.filter((e: Expense) => {
      const d = new Date(e.date);
      return e.userId === userId && d >= startDate && d <= endDate;
    });
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const store = getStore();
    const expense: Expense = { id: store.ids.expenses++, ...insertExpense } as Expense;
    store.expenses.push(expense);
    cache.delete(`expenses:${expense.userId}`);
    cache.delete(`dashboard:${expense.userId}`);
    return expense;
  }

  async updateExpense(id: number, expenseUpdate: Partial<InsertExpense>): Promise<Expense | undefined> {
    const store = getStore();
    const idx = store.expenses.findIndex((e: Expense) => e.id === id);
    if (idx === -1) return undefined;
    const updated: Expense = { ...store.expenses[idx], ...expenseUpdate } as Expense;
    store.expenses[idx] = updated;
    cache.delete(`expenses:${updated.userId}`);
    cache.delete(`dashboard:${updated.userId}`);
    return updated;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const store = getStore();
    const idx = store.expenses.findIndex((e: Expense) => e.id === id);
    if (idx === -1) return false;
    const userId = store.expenses[idx].userId;
    store.expenses.splice(idx, 1);
    cache.delete(`expenses:${userId}`);
    cache.delete(`dashboard:${userId}`);
    return true;
  }

  async getBills(userId: number): Promise<Bill[]> {
    const key = `bills:${userId}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
    const data = getStore().bills.filter((b: Bill) => b.userId === userId);
    cache.set(key, { ts: Date.now(), data });
    return data;
  }

  async getBillsDue(userId: number, days: number): Promise<Bill[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    return getStore().bills.filter((b: Bill) => {
      const d = new Date(b.dueDate);
      return b.userId === userId && !b.isPaid && d <= futureDate;
    });
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const store = getStore();
    const bill: Bill = {
      id: store.ids.bills++,
      isPaid: false,
      isRecurring: false,
      recurringPeriod: null as unknown as string,
      ...insertBill
    } as Bill;
    store.bills.push(bill);
    cache.delete(`bills:${bill.userId}`);
    cache.delete(`dashboard:${bill.userId}`);
    return bill;
  }

  async updateBill(id: number, billUpdate: Partial<InsertBill>): Promise<Bill | undefined> {
    const store = getStore();
    const idx = store.bills.findIndex((b: Bill) => b.id === id);
    if (idx === -1) return undefined;
    const updated: Bill = { ...store.bills[idx], ...billUpdate } as Bill;
    store.bills[idx] = updated;
    cache.delete(`bills:${updated.userId}`);
    cache.delete(`dashboard:${updated.userId}`);
    return updated;
  }

  async markBillAsPaid(id: number): Promise<Bill | undefined> {
    return this.updateBill(id, { isPaid: true } as Partial<InsertBill>);
  }

  async deleteBill(id: number): Promise<boolean> {
    const store = getStore();
    const idx = store.bills.findIndex((b: Bill) => b.id === id);
    if (idx === -1) return false;
    const userId = store.bills[idx].userId;
    store.bills.splice(idx, 1);
    cache.delete(`bills:${userId}`);
    cache.delete(`dashboard:${userId}`);
    return true;
  }

  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    const key = `goals:${userId}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
    const data = getStore().savingsGoals.filter((g: SavingsGoal) => g.userId === userId);
    cache.set(key, { ts: Date.now(), data });
    return data;
  }

  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    return getStore().savingsGoals.find((g: SavingsGoal) => g.id === id);
  }

  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const store = getStore();
    const goal: SavingsGoal = { id: store.ids.goals++, currentAmount: 0, ...insertGoal } as SavingsGoal;
    store.savingsGoals.push(goal);
    cache.delete(`goals:${goal.userId}`);
    cache.delete(`dashboard:${goal.userId}`);
    return goal;
  }

  async updateSavingsGoal(id: number, goalUpdate: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const store = getStore();
    const idx = store.savingsGoals.findIndex((g: SavingsGoal) => g.id === id);
    if (idx === -1) return undefined;
    const updated: SavingsGoal = { ...store.savingsGoals[idx], ...goalUpdate } as SavingsGoal;
    store.savingsGoals[idx] = updated;
    cache.delete(`goals:${updated.userId}`);
    cache.delete(`dashboard:${updated.userId}`);
    return updated;
  }

  async deleteSavingsGoal(id: number): Promise<boolean> {
    const store = getStore();
    const idx = store.savingsGoals.findIndex((g: SavingsGoal) => g.id === id);
    if (idx === -1) return false;
    const userId = store.savingsGoals[idx].userId;
    store.savingsGoals.splice(idx, 1);
    cache.delete(`goals:${userId}`);
    cache.delete(`dashboard:${userId}`);
    return true;
  }

  async getBudgets(userId: number): Promise<Budget[]> {
    const key = `budgets:${userId}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
    const data = getStore().budgets.filter((b: Budget) => b.userId === userId);
    cache.set(key, { ts: Date.now(), data });
    return data;
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    return getStore().budgets.find((b: Budget) => b.id === id);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const store = getStore();
    const budget: Budget = { id: store.ids.budgets++, ...insertBudget } as Budget;
    store.budgets.push(budget);
    cache.delete(`budgets:${budget.userId}`);
    cache.delete(`dashboard:${budget.userId}`);
    return budget;
  }

  async updateBudget(id: number, budgetUpdate: Partial<InsertBudget>): Promise<Budget | undefined> {
    const store = getStore();
    const idx = store.budgets.findIndex((b: Budget) => b.id === id);
    if (idx === -1) return undefined;
    const updated: Budget = { ...store.budgets[idx], ...budgetUpdate } as Budget;
    store.budgets[idx] = updated;
    cache.delete(`budgets:${updated.userId}`);
    cache.delete(`dashboard:${updated.userId}`);
    return updated;
  }

  async deleteBudget(id: number): Promise<boolean> {
    const store = getStore();
    const idx = store.budgets.findIndex((b: Budget) => b.id === id);
    if (idx === -1) return false;
    const userId = store.budgets[idx].userId;
    store.budgets.splice(idx, 1);
    cache.delete(`budgets:${userId}`);
    cache.delete(`dashboard:${userId}`);
    return true;
  }

  // Aggregated dashboard summary
  async getDashboardSummary(userId: number) {
    const key = `dashboard:${userId}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

    const store = getStore();
    const expenses = store.expenses.filter((e: Expense) => e.userId === userId);
    const categories = store.categories;
    const bills = store.bills.filter((b: Bill) => b.userId === userId);
    const goals = store.savingsGoals.filter((g: SavingsGoal) => g.userId === userId);
    const budgets = store.budgets.filter((b: Budget) => b.userId === userId);

    // total spent (exclude Income category)
    const incomeCat = categories.find((c: Category) => c.name === 'Income');
    const filteredExpenses = expenses.filter((e: Expense) => e.categoryId !== incomeCat?.id);
    const totalSpent = filteredExpenses.reduce((s: number, e: Expense) => s + e.amount, 0);

    // total budget (monthly overall)
    const monthlyBudget = budgets.find((b: Budget) => b.categoryId === null && b.period === 'monthly');
    const totalBudget = monthlyBudget ? monthlyBudget.amount : 0;

    // upcoming bills amount and count
    const unpaidBills = bills.filter((b: Bill) => !b.isPaid);
    const upcomingBillsAmount = unpaidBills.reduce((s: number, b: Bill) => s + b.amount, 0);

    // recent transactions (latest 5)
    // Create copy for sorting
    const recentTransactions = [...expenses]
      .sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((e: Expense) => {
        const category = categories.find((c: Category) => c.id === e.categoryId);
        return {
          id: e.id,
          description: e.description,
          category: { id: category?.id, name: category?.name || 'Other', color: category?.color || '#94A3B8', icon: category?.icon },
          date: e.date,
          amount: e.amount,
          isIncome: category?.name === 'Income'
        };
      });

    // category breakdown
    const breakdownMap = new Map<number, number>();
    for (const e of filteredExpenses) {
      breakdownMap.set(e.categoryId, (breakdownMap.get(e.categoryId) || 0) + e.amount);
    }
    const totalForBreakdown = Array.from(breakdownMap.values()).reduce((s, v) => s + v, 0);
    const categoryBreakdown = Array.from(breakdownMap.entries())
      .map(([categoryId, amount]) => {
        const cat = categories.find((c: Category) => c.id === categoryId);
        if (!cat) return null;
        return {
          id: categoryId,
          name: cat.name,
          amount,
          percentage: totalForBreakdown ? Math.round((amount / totalForBreakdown) * 100) : 0,
          color: cat.color
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.amount - a.amount);

    // chart data for default 'day' view
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData = new Array(7).fill(0).map((_, i) => ({ date: days[i], amount: 0 }));
    for (const e of filteredExpenses) {
      const day = new Date(e.date).getDay();
      if (dailyData[day]) {
        dailyData[day].amount += e.amount;
      }
    }

    const summary = {
      totalSpent,
      totalBudget,
      upcomingBillsAmount,
      recentTransactions,
      categoryBreakdown,
      chartData: dailyData,
      goals
    };

    cache.set(key, { ts: Date.now(), data: summary });
    return summary;
  }

  async initializeDefaults(): Promise<void> {
    const store = getStore();
    // Only initialize if categories are empty
    if (store.categories.length === 0) {
      const defaultCategories = [
        { name: "Food & Dining", color: "#38BDF8", icon: "ri-restaurant-line" },
        { name: "Transportation", color: "#818CF8", icon: "ri-car-line" },
        { name: "Shopping", color: "#FB7185", icon: "ri-shopping-bag-line" },
        { name: "Entertainment", color: "#34D399", icon: "ri-movie-line" },
        { name: "Housing", color: "#F472B6", icon: "ri-home-line" },
        { name: "Utilities", color: "#FBBF24", icon: "ri-lightbulb-line" },
        { name: "Health", color: "#A3E635", icon: "ri-heart-pulse-line" },
        { name: "Income", color: "#22C55E", icon: "ri-money-dollar-circle-line" },
        { name: "Other", color: "#94A3B8", icon: "ri-price-tag-3-line" },
      ];
      for (const category of defaultCategories) {
        await this.createCategory(category as InsertCategory);
      }
    }

    // Check if we need to add a demo user and initial data
    if (store.users.length === 0) {
      // Add demo user
      await this.createUser({
        username: "demo",
        password: "password",
        displayName: "Jamie Smith",
        email: "demo@example.com"
      });

      // Add some sample data if needed here...
    }
  }
}

export const storage = new InMemoryStorage();