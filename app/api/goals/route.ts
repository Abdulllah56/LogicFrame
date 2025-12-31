import { NextRequest, NextResponse } from 'next/server';

// Shared data store using global object
const getGoalsData = () => {
  if (typeof global !== 'undefined' && !(global as any).goalsData) {
    (global as any).goalsData = [
      {
        id: 1,
        userId: 1,
        name: "Emergency Fund",
        targetAmount: 10000,
        currentAmount: 3500,
        targetDate: new Date("2024-12-31").toISOString(),
        icon: "ri-bank-line",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        userId: 1,
        name: "Vacation to Japan",
        targetAmount: 5000,
        currentAmount: 1200,
        targetDate: new Date("2024-08-15").toISOString(),
        icon: "ri-plane-line",
        createdAt: new Date().toISOString(),
      },
    ];
    (global as any).nextGoalId = 3;
  }
  return (global as any).goalsData;
};

const getNextId = () => {
  if (typeof global !== 'undefined' && !(global as any).nextGoalId) {
    (global as any).nextGoalId = 3;
  }
  return (global as any).nextGoalId++;
};

export async function GET(request: NextRequest) {
  try {
    const goalsData = getGoalsData();
    // In a real app, you'd get userId from session/auth
    const userId = 1;
    const userGoals = goalsData.filter((goal: any) => goal.userId === userId);
    return NextResponse.json(userGoals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const goalsData = getGoalsData();
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.targetAmount) {
      return NextResponse.json(
        { error: 'Name and target amount are required' },
        { status: 400 }
      );
    }

    const newGoal = {
      id: getNextId(),
      userId: 1, // In a real app, get from session/auth
      name: body.name,
      targetAmount: body.targetAmount,
      currentAmount: body.currentAmount || 0,
      targetDate: body.targetDate || null,
      icon: body.icon || 'ri-bank-line',
      createdAt: new Date().toISOString(),
    };

    goalsData.push(newGoal);
    
    console.log('Goal created:', newGoal);
    
    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}