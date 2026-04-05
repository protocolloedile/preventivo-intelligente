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
    const { userId, email, trialDays, planType } = req.body;

    const sessionConfig = {
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: planType === "annual" ? "Preventivo Intelligente - Pro Annuale" : "Preventivo Intelligente - Pro Mensile",
              description: "Accesso completo a tutte le funzionalità",
            },
            unit_amount: planType === "annual" ? 29700 : 4700,
            recurring: { interval: planType === "annual" ? "year" : "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
      success_url: `${req.headers.origin || "https://preventivointelligente.vercel.app"}?subscription=success`,
      cancel_url: `${req.headers.origin || "https://preventivointelligente.vercel.app"}?subscription=cancelled`,
    };

    // Add trial period if promo code provides free days
    if (trialDays && trialDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: trialDays,
        metadata: { userId },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
}
