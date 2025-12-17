const Stripe = require("stripe");
const { client } = require("../config/database"); // import Mongo client if needed
const stripe = Stripe(process.env.STRIPE_SECRET); // must match .env key
console.log(process.env.STRIPE_SECRET);
const fetch = require('node-fetch')

/**
 * @param {import('express').Express} app
 */
async function stripeRoutes(app) {
  const db = client.db("myDatabase");

async function getConversionRate() {
  const response = await fetch("https://v6.exchangerate-api.com/v6/c334fe63cfcba756f76dc089/latest/USD");
  const data = await response.json();
  console.log('Data from Conversion',data.conversion_rates.BDT);
  return data?.conversion_rates?.BDT; // current BDT → USD rate
}


  // Create a checkout session
  app.post("/create-checkout-session", async (req, res) => {
    try {
      const paymentInfo = req.body;
      console.log(paymentInfo);
      const rate = await getConversionRate()
      if (!paymentInfo.amount || !paymentInfo.customer_email) {
        return res.status(400).send({ message: "Price and email are required" });
      }

      const amountExact = (parseInt(paymentInfo.amount) / rate) * 100; 

      const amount = Math.floor(amountExact)
      
      console.log(amountExact,amount);// Stripe expects cents
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: {
              name: paymentInfo.foodName || "Meal Order", 
              },
            },
            quantity: 1,
          },
        ],
        customer_email: paymentInfo.customer_email, // correct spelling
        mode: "payment",
        metadata: {
          parcelId: paymentInfo.mealId,
        },
        success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success`,
        cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancel`,
      });

      console.log("Stripe Session Created:", session.id);
      console.log(session);
      res.send({ url: session.url });

    } catch (error) {
    //   console.error("Stripe checkout error:", error);
      res.status(500).send({ message: "Stripe checkout session failed", error });
    }
  });
}

module.exports = { stripeRoutes };
