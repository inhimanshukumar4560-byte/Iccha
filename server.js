const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const path = require('path');

// Express app setup
const app = express();
app.use(cors());
app.use(express.json()); // Frontend se aane wale JSON data ko read karne ke liye

// Aapki HTML, CSS, JS, images (Frontend) ko serve karne ke liye
app.use(express.static(path.join(__dirname)));

// Default route - Jab koi website kholega toh usko index.html dikhega
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Razorpay API Route - Naya Order create karne ke liye
app.post('/create-order', async (req, res) => {
    try {
        // Frontend (index.html) se amount aayega (Rupees mein)
        const { amount } = req.body;

        // Razorpay ka setup (Render ke Environment Variables se automatically keys uthayega)
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Order ki details
        const options = {
            amount: amount * 100, // Razorpay amount ko humesha Paise mein leta hai (₹1 = 100 paise)
            currency: "INR",
            receipt: "receipt_" + Date.now(), // Har order ka ek unique receipt number
        };

        // Razorpay ke server se secure order_id create karwana
        const order = await razorpay.orders.create(options);

        // Frontend ko order details waapas bhejna
        res.status(200).json(order);
    } catch (err) {
        console.error("Order Creation Error:", err);
        res.status(500).json({ error: "Backend mein kuch problem aayi!" });
    }
});

// Server Start karna
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
