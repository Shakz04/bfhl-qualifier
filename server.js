const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const EMAIL = "your_email@chitkara.edu.in";


// ================= HEALTH =================
app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});


// ================= HELPERS =================
function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];

  const arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}


// ================= BFHL =================
app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);

    // only one key allowed
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Exactly one key is required"
      });
    }

    const key = keys[0];
    const value = req.body[key];

    let data;

    // ---------- fibonacci ----------
    if (key === "fibonacci") {
      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "Invalid input for fibonacci"
        });
      }
      data = fibonacci(value);
    }

    // ---------- prime ----------
    else if (key === "prime") {
      if (!Array.isArray(value)) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "Prime expects array"
        });
      }
      data = value.filter(isPrime);
    }

    // ---------- hcf ----------
    else if (key === "hcf") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "HCF expects non-empty array"
        });
      }
      data = value.reduce((a, b) => gcd(a, b));
    }

    // ---------- lcm ----------
    else if (key === "lcm") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "LCM expects non-empty array"
        });
      }
      data = value.reduce((a, b) => lcm(a, b));
    }

    // ---------- AI ----------
    else if (key === "AI") {
      if (typeof value !== "string" || value.trim() === "") {
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
          error: "AI expects a question string"
        });
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_KEY}`,
        {
          contents: [{ parts: [{ text: value }] }]
        }
      );

      let answer =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // single word
      data = answer.trim().split(/\s+/)[0];
    }

    // ---------- invalid ----------
    else {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Invalid key"
      });
    }

    return res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (err) {
    return res.status(500).json({
      is_success: false,
      official_email: EMAIL,
      error: "Internal server error"
    });
  }
});


// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
