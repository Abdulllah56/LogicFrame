import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../financefriend/server/storage';
import { insertBillSchema } from '../../financefriend/shared/schema';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const userId = 1; // Demo user
    const bills = await storage.getBills(userId);
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = 1; // Demo user

    // Ensure data conforms to schema
    const billData = {
      ...body,
      userId,
      // Ensure defaults if missing (though client usually sends them)
      isPaid: body.isPaid || false,
      isRecurring: body.isRecurring || false,
    };

    // Validate using the shared schema if possible, or manual check
    try {
      const validated = insertBillSchema.parse(billData);
      const newBill = await storage.createBill(validated);
      return NextResponse.json(newBill, { status: 201 });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.errors },
          { status: 400 }
        );
      }
      // Fallback for simple validation if schema fails or isn't perfect matches
      if (!body.name || !body.amount || !body.dueDate) {
        return NextResponse.json(
          { error: 'Name, amount and due date are required' },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    );
  }
}
