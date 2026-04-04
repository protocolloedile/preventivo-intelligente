import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find customer by email
    const customers = await stripe.customers.list({ email: email, limit: 1 });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: "No customer found with this email" });
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1,
    });

    // Also check trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "trialing",
      limit: 1,
    });

    const allSubs = [...subscriptions.data, ...trialingSubscriptions.data];

    if (allSubs.length === 0) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Cancel at period end (not immediately)
    const canceledSub = await stripe.subscriptions.update(allSubs[0].id, {
      cancel_at_period_end: true,
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      success: true,
      message: "Subscription will be canceled at the end of the current period",
      cancelAt: canceledSub.current_period_end,
    });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    res.status(500).json({ error: err.message });
  }
}
