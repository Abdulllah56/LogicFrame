import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../FinanceFriend/server/storage';

export async function GET(request: NextRequest) {
    try {
        const start = request.nextUrl.searchParams.get('start');
        const end = request.nextUrl.searchParams.get('end');
        const userId = 1; // Demo user

        if (!start || !end) {
            return NextResponse.json(
                { error: 'Start and end dates are required' },
                { status: 400 }
            );
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        const expenses = await storage.getExpensesByDateRange(userId, startDate, endDate);
        return NextResponse.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses range:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expenses range' },
            { status: 500 }
        );
    }
}
