const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ---------- Helper functions  ---------- */
const getFibonacci = (n) => {
  let series = [0, 1];
  for (let i = 2; i < n; i++) {
    series.push(series[i - 1] + series[i - 2]);
  }
  return n <= 0 ? [] : series.slice(0, n);
};

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a, b) => (a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b));

/* ---------- GET /health [cite: 23, 94] ---------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: "gurmehar1832.be23@chitkara.edu.in"
  });
});

/* ---------- POST /bfhl [cite: 22, 30] ---------- */
app.post("/bfhl", async (req, res) => {
  const officialEmail = "gurmehar1832.be23@chitkara.edu.in";
  try {
    const body = req.body;
    let result;

    // 1. Fibonacci Logic [cite: 34, 46]
    if (body.fibonacci !== undefined) {
      result = getFibonacci(parseInt(body.fibonacci));
    }

    // 2. Prime Logic [cite: 34, 56]
    else if (body.prime !== undefined && Array.isArray(body.prime)) {
      result = body.prime.filter(isPrime);
    }

    // 3. LCM Logic [cite: 34, 66]
    else if (body.lcm !== undefined && Array.isArray(body.lcm)) {
      result = body.lcm.length ? body.lcm.reduce((a, b) => lcm(a, b)) : 0;
    }

    // 4. HCF Logic [cite: 34, 76]
    else if (body.hcf !== undefined && Array.isArray(body.hcf)) {
      result = body.hcf.length ? body.hcf.reduce((a, b) => gcd(a, b)) : 0;
    }

    // 5. AI Logic (GROQ) - Handles multi-word like "New Delhi" 
    else if (body.AI !== undefined) {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "Answer the question directly in 1-2 words maximum. No sentences, no punctuation."
            },
            {
              role: "user",
              content: body.AI
            }
          ],
          max_tokens: 15,
          temperature: 0.1
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Entire trimmed response is taken to handle "New Delhi" 
      result = response.data.choices[0].message.content.trim().replace(/[.]+$/, "");
    }

    // 6. Validation for missing keys [cite: 11, 42]
    else {
      return res.status(400).json({
        is_success: false,
        official_email: officialEmail
      });
    }

    // Success Response [cite: 35, 39]
    res.status(200).json({
      is_success: true,
      official_email: officialEmail,
      data: result
    });

  } catch (error) {
    // Graceful error handling [cite: 12, 42]
    console.error("Error details:", error.response?.data || error.message);
    res.status(500).json({
      is_success: false,
      official_email: officialEmail
    });
  }
});

/* ---------- Start server ---------- */
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});