import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../FinanceFriend/server/storage';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const billId = parseInt(id);

        const updatedBill = await storage.markBillAsPaid(billId);

        if (!updatedBill) {
            return NextResponse.json(
                { error: 'Bill not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedBill);
    } catch (error) {
        console.error('Error paying bill:', error);
        return NextResponse.json(
            { error: 'Failed to mark bill as paid' },
            { status: 500 }
        );
    }
}
