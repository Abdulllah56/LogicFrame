import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../FinanceFriend/server/storage';
import { insertExpenseSchema } from '../../FinanceFriend/shared/schema';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const userId = 1; // Demo user
    const expenses = await storage.getExpenses(userId);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = 1; // Demo user

    const expenseData = {
      ...body,
      userId,
      // Convert date string to Date if needed, schema transform handles string input
    };

    try {
      const validated = insertExpenseSchema.parse(expenseData);
      // Ensure currency default if not present in schema output (zod transform/defaults)
      if (!validated.currency) validated.currency = 'USD';

      const newExpense = await storage.createExpense(validated);
      return NextResponse.json(newExpense, { status: 201 });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.errors },
          { status: 400 }
        );
      }
      if (!body.amount || !body.categoryId) {
        return NextResponse.json(
          { error: 'Amount and category are required' },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}