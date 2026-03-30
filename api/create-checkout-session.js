import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, email } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Preventivo Intelligente - Piano Pro",
              description: "Accesso completo a tutte le funzionalità",
            },
            unit_amount: 4700,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
      success_url: `${req.headers.origin}?subscription=success`,
      cancel_url: `${req.headers.origin}?subscription=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
}
