import { NextRequest, NextResponse } from 'next/server';

// Shared data store using global object
const getBudgetsData = () => {
  if (typeof global !== 'undefined' && !(global as any).budgetsData) {
    (global as any).budgetsData = [];
    (global as any).nextBudgetId = 1;
  }
  return (global as any).budgetsData;
};

const getNextId = () => {
  if (typeof global !== 'undefined' && !(global as any).nextBudgetId) {
    (global as any).nextBudgetId = 1;
  }
  return (global as any).nextBudgetId++;
};

export async function GET(request: NextRequest) {
  try {
    const budgetsData = getBudgetsData();
    // In a real app, you'd get userId from session/auth
    const userId = 1;
    const userBudgets = budgetsData.filter((budget: any) => budget.userId === userId);
    return NextResponse.json(userBudgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const budgetsData = getBudgetsData();
    const body = await request.json();

    // Validate required fields
    if (!body.amount || !body.period) {
      return NextResponse.json(
        { error: 'Amount and period are required' },
        { status: 400 }
      );
    }

    const newBudget = {
      id: getNextId(),
      userId: 1, // In a real app, get from session/auth
      categoryId: body.categoryId || null,
      amount: body.amount,
      period: body.period,
      createdAt: new Date().toISOString(),
    };

    budgetsData.push(newBudget);

    console.log('Budget created:', newBudget);

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const budgetsData = getBudgetsData();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    const budgetIndex = budgetsData.findIndex((budget: any) => budget.id === id);
    if (budgetIndex === -1) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    budgetsData[budgetIndex] = { ...budgetsData[budgetIndex], ...updateData };

    console.log('Budget updated:', budgetsData[budgetIndex]);

    return NextResponse.json(budgetsData[budgetIndex]);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const budgetsData = getBudgetsData();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    const budgetIndex = budgetsData.findIndex((budget: any) => budget.id === id);
    if (budgetIndex === -1) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    budgetsData.splice(budgetIndex, 1);

    console.log('Budget deleted:', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}