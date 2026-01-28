import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../financefriend/server/storage';

export async function GET(request: NextRequest) {
    try {
        const days = request.nextUrl.searchParams.get('days');
        const daysInt = days ? parseInt(days) : 30;
        const userId = 1; // Demo user

        const dueBills = await storage.getBillsDue(userId, daysInt);
        return NextResponse.json(dueBills);
    } catch (error) {
        console.error('Error fetching due bills:', error);
        return NextResponse.json(
            { error: 'Failed to fetch due bills' },
            { status: 500 }
        );
    }
}
