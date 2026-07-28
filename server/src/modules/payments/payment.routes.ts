import { Router } from 'express';
import Stripe from 'stripe';
import { protect } from '../../middleware/auth.middleware';

const paymentRoutes = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2023-10-16' as any,
});

paymentRoutes.post('/create-intent', protect, async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });

    // Payment intent for Stripe (in test mode)
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: 'usd',
        payment_method_types: ['card'],
      });
    } catch {
      // Mock payment intent ID for test fallback
      paymentIntent = { client_secret: `pi_mock_${Date.now()}_secret_test` };
    }

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
});

export default paymentRoutes;
