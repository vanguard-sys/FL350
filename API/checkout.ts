
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-01-28.clover' as any,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { cart, userId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.name} (${item.size})`,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      // CRITICAL: Link Clerk user ID to the Stripe session for reconciliation
      client_reference_id: userId,
      metadata: {
        clerk_user_id: userId,
        cart_summary: cart.map((i: any) => `${i.quantity}x ${i.name} (${i.size})`).join(', ')
      },
      success_url: `${req.headers.origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Session Error:', err);
    res.status(500).json({ statusCode: 500, message: err.message });
  }
}
