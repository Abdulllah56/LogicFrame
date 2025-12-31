import { NextRequest, NextResponse } from 'next/server';

// This would be imported from a shared data store in a real app
// For now, we'll use a simple in-memory store
const getGoalsData = () => {
  // This is a workaround to share data between route handlers
  // In a real app, you'd use a database
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
  }
  return (global as any).goalsData;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const goalsData = getGoalsData();
    
    const goalIndex = goalsData.findIndex((g: any) => g.id === id);
    
    if (goalIndex === -1) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Update the goal
    goalsData[goalIndex] = {
      ...goalsData[goalIndex],
      ...body,
      id, // Ensure ID doesn't change
      userId: goalsData[goalIndex].userId, // Ensure userId doesn't change
    };

    console.log('Goal updated:', goalsData[goalIndex]);

    return NextResponse.json(goalsData[goalIndex]);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const goalsData = getGoalsData();
    
    const goalIndex = goalsData.findIndex((g: any) => g.id === id);
    
    if (goalIndex === -1) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Remove the goal
    goalsData.splice(goalIndex, 1);

    console.log('Goal deleted:', id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}