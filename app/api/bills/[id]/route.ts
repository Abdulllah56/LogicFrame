import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../FinanceFriend/server/storage';
import { insertBillSchema } from '../../../FinanceFriend/shared/schema';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const billId = parseInt(id);
        const body = await request.json();

        // Using partial update from storage
        // Validate body if necessary, but storage.updateBill handles Partial<InsertBill>
        const updatedBill = await storage.updateBill(billId, body);

        if (!updatedBill) {
            return NextResponse.json(
                { error: 'Bill not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedBill);
    } catch (error) {
        console.error('Error updating bill:', error);
        return NextResponse.json(
            { error: 'Failed to update bill' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const billId = parseInt(id);

        const success = await storage.deleteBill(billId);

        if (!success) {
            return NextResponse.json(
                { error: 'Bill not found' },
                { status: 404 }
            );
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting bill:', error);
        return NextResponse.json(
            { error: 'Failed to delete bill' },
            { status: 500 }
        );
    }
}
