
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Fixed: Updated Stripe API version to '2026-01-28.clover' to match the expected library type
  apiVersion: '2026-01-28.clover' as any,
});

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      // If you have a webhook secret, verify the signature
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // MISSION LOGIC:
      // Here is where you would save the order to Sanity.io
      // or send yourself a custom notification.
      console.log('SUCCESSFUL EXPEDITION:', session.id);
      console.log('CUSTOMER:', session.customer_details.email);
      
      // Example Sanity creation (requires SANITY_WRITE_TOKEN):
      /*
      await sanityClient.create({
        _type: 'order',
        orderId: session.id,
        customer: session.customer_details.name,
        email: session.customer_details.email,
        amount: session.amount_total / 100,
        items: JSON.parse(session.metadata.cart_items)
      });
      */
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
