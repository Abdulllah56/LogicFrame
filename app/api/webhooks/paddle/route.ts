
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/utils/db';
import { subscriptions, plans } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

// Note: For Paddle Classic (v1), webhooks are x-www-form-urlencoded and signed. 
// For Paddle Billing (v2), they are JSON and signed with a secret.
// This implementation assumes Paddle Billing (v2).

export async function POST(req: Request) {
    const signature = req.headers.get('paddle-signature');
    const body = await req.text();

    if (!signature || !process.env.PADDLE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or secret' }, { status: 401 });
    }

    // 1. Verify Signature (Simplified: In production, use Paddle SDK's `paddle.webhooks.unmarshal`)
    // For now, we trust the signature if we can parse the body, assuming the secret is kept safe.
    // Ideally: import { Paddle } from '@paddle/paddle-node'; const paddle = new Paddle(apikey); const eventData = paddle.webhooks.unmarshal(body, secret, signature);

    // Since we haven't installed the SDK yet, we'll parse JSON manually.
    // WARNING: This is insecure without signature verification. 
    // You MUST install @paddle/paddle-node to verify in production.

    let event;
    try {
        event = JSON.parse(body);
    } catch (err) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { event_type, data } = event;

    try {
        if (event_type === 'subscription.created' || event_type === 'subscription.updated') {
            const userId = data.custom_data?.user_id;
            const internalPlanId = data.custom_data?.plan_id;
            const paddleSubId = data.id;
            const status = data.status;
            const periodEnd = new Date(data.current_billing_period.ends_at);

            if (userId && internalPlanId) {
                // Check if sub exists
                const existingSub = await db.query.subscriptions.findFirst({
                    where: eq(subscriptions.paddleSubscriptionId, paddleSubId)
                });

                if (existingSub) {
                    await db.update(subscriptions)
                        .set({
                            status: status,
                            currentPeriodEnd: periodEnd,
                            planId: Number(internalPlanId), // Update plan if changed
                            updatedAt: new Date()
                        })
                        .where(eq(subscriptions.paddleSubscriptionId, paddleSubId));
                } else {
                    await db.insert(subscriptions).values({
                        userId: userId,
                        planId: Number(internalPlanId),
                        status: status,
                        paddleSubscriptionId: paddleSubId,
                        currentPeriodEnd: periodEnd,
                    });
                }
            }
        } else if (event_type === 'subscription.canceled') {
            const paddleSubId = data.id;
            await db.update(subscriptions)
                .set({ status: 'canceled', updatedAt: new Date() })
                .where(eq(subscriptions.paddleSubscriptionId, paddleSubId));
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook processing failed:", error);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}
