// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const Product = require("../models/productmodel");

// const categoryMap = {
//   موبايل: "phones",
//   هواتف: "phones",
//   لابتوب: "laptops",
//   لاب: "laptops",
//   سماعة: "headphones",
//   سماعات: "headphones",
//   ساعة: "smartwatch",
//   ساعات: "smartwatch",
// };

// router.post("/", async (req, res) => {
//   const { message } = req.body;

//   try {
//     const detectedCategory = Object.keys(categoryMap).find((key) =>
//       message.includes(key)
//     );

//     let productsFound = [];
//     if (detectedCategory) {
//       productsFound = await Product.find({
//         category: categoryMap[detectedCategory],
//       }).limit(5);
//     }

//     const productSummary = productsFound
//       .map((p) => `${p.name} - السعر: ${p.price}$`)
//       .join("\n");

//     const promptText = `
// أنت Aura Assistant، مساعد متجر Aura Store.
// رد على المستخدم بالعربية بطريقة ودودة ومساعدة.

// سؤال المستخدم: ${message}
// ${
//   productsFound.length > 0
//     ? `المنتجات المتاحة في الفئة المطلوبة:\n${productSummary}`
//     : "لم يتم العثور على منتجات مطابقة في قاعدة البيانات."
// }
// قدّم ردًا ودّيًا واقتراحًا مفيدًا إذا لم يجد ما يريده.
// `;

//     const aiResponse = await axios.post(
//    "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"

// ,
//       { inputs: promptText },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HF_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const botReply =
//       aiResponse.data[0]?.generated_text || "مش قادر أرد دلوقتي 😅";

//     res.json({
//       reply: botReply,
//       products: productsFound,
//     });
//   } catch (error) {
//     console.error("AI Error:", error.response?.data || error.message);
//     res.status(500).json({ error: "حصل خطأ في Aura Assistant" });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const { askAI } = require("../controllers/auraAssistantController");

router.post("/ask", askAI);

module.exports = router;

