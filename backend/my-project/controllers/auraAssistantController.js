const Chat = require('../models/chatmodel');
const Product = require('../models/productmodel');

const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

const keywords = {
  greetings: {
    ar: ['مرحبًا', 'هاي', 'السلام عليكم', 'أهلاً', 'مساء الخير', 'صباح الخير', 'ازيك'],
    en: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
  },
  products: {
    ar: ['منتجاتكم', 'ايه المنتجات', 'اعرض المنتجات', 'المنتجات', 'بتبيعوا ايه'],
    en: ['your products', 'show me products', 'products', 'list products', 'what products']
  },
  prices: {
    ar: ['اسعاركم', 'كم السعر', 'السعر'],
    en: ['your prices', 'price', 'what is the price']
  },
  delivery: {
    ar: ['بيوصل في قد ايه', 'متى يوصل', 'كم يوم التوصيل', 'وقت التوصيل'],
    en: ['how long to deliver', 'delivery time', 'when will it arrive']
  },
  shippingCost: {
    ar: ['تكلفة الشحن', 'سعر الشحن', 'الشحن بكام'],
    en: ['shipping cost', 'delivery charge', 'how much is shipping']
  },
  contact: {
    ar: ['تواصل معنا', 'عايزة أكلم حد', 'رقم التواصل', 'الدعم', 'خدمة العملاء'],
    en: ['contact us', 'support', 'help center', 'customer service']
  }
};

const askAI = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Send a question to AI' });

  const arabic = isArabic(prompt);
  const lowerPrompt = prompt.toLowerCase();
  let aiResponses = [];
  let suggestions = [];

  try {
    const isGreeting = arabic
      ? keywords.greetings.ar.some(k => lowerPrompt.includes(k.toLowerCase()))
      : keywords.greetings.en.some(k => lowerPrompt.includes(k.toLowerCase()));

    if (isGreeting) {
      aiResponses.push(
        arabic
          ? 'أهلاً! أنا Aura Assistant 🤖 جاهزة أساعدك في أي استفسار عن منتجاتنا. تحبي أبدأ أعرضلك المنتجات؟'
          : 'Hello! I’m Aura Assistant 🤖 I can help you with anything about our products. Would you like me to show some products?'
      );
      suggestions = arabic
        ? ['اعرض المنتجات', 'اسعار المنتجات', 'تواصل معنا']
        : ['Show products', 'Product prices', 'Contact us'];
    } else {
      const askingProducts = arabic
        ? keywords.products.ar.some(k => lowerPrompt.includes(k.toLowerCase()))
        : keywords.products.en.some(k => lowerPrompt.includes(k.toLowerCase()));

      const askingPrices = arabic
        ? keywords.prices.ar.some(k => lowerPrompt.includes(k.toLowerCase()))
        : keywords.prices.en.some(k => lowerPrompt.includes(k.toLowerCase()));

      const askingDelivery = arabic
        ? keywords.delivery.ar.some(k => lowerPrompt.includes(k.toLowerCase()))
        : keywords.delivery.en.some(k => lowerPrompt.includes(k.toLowerCase()));

      const askingShippingCost = arabic
        ? keywords.shippingCost.ar.some(k => lowerPrompt.includes(k.toLowerCase()))
        : keywords.shippingCost.en.some(k => lowerPrompt.includes(k.toLowerCase()));

      const askingContact = arabic
        ? keywords.contact.ar.some(k => lowerPrompt.includes(k.toLowerCase()))
        : keywords.contact.en.some(k => lowerPrompt.includes(k.toLowerCase()));

      if (askingProducts || askingPrices) {
        const products = await Product.find().limit(5);
        if (products.length > 0) {
          aiResponses.push(
            arabic
              ? askingProducts
                ? 'إليك بعض منتجاتنا:'
                : 'إليك أسعار بعض المنتجات:'
              : askingProducts
              ? 'Here are some of our products:'
              : 'Here are prices for some products:'
          );
          products.forEach(p => {
            aiResponses.push(
              arabic
                ? `${p.name} (${p.price} دولار)`
                : `${p.name} (${p.price} $)`
            );
          });
          suggestions = arabic
            ? ['وقت التوصيل', 'تكلفة الشحن', 'تواصل معنا']
            : ['Delivery time', 'Shipping cost', 'Contact us'];
        } else {
          aiResponses.push(
            arabic ? 'آسفة 😅 لا توجد منتجات حالياً.' : 'Sorry 😅, no products are available now.'
          );
        }

      } else if (askingDelivery) {
        aiResponses.push(
          arabic
            ? '🕒 التوصيل يستغرق من 3 إلى 7 أيام داخل مصر، و7 إلى 14 يوم دوليًا. تحبي أعرفك تكلفة الشحن؟'
            : '🕒 Delivery takes 3–7 business days locally and 7–14 days internationally. Would you like me to check the shipping cost?'
        );
        suggestions = arabic
          ? ['تكلفة الشحن', 'اعرض المنتجات', 'تواصل معنا']
          : ['Shipping cost', 'Show products', 'Contact us'];

      } else if (askingShippingCost) {
        aiResponses.push(
          arabic
            ? '💰 تكلفة الشحن تبدأ من 30 جنيه داخل مصر وقد تختلف حسب المنطقة.'
            : '💰 Shipping cost starts from $5 locally and may vary by location.'
        );
        suggestions = arabic
          ? ['وقت التوصيل', 'اعرض المنتجات', 'تواصل معنا']
          : ['Delivery time', 'Show products', 'Contact us'];

      } else if (askingContact) {
        aiResponses.push(
          arabic
            ? '📞 يمكنك التواصل معنا عبر:\n- البريد الإلكتروني: support@aurastore.com\n- أو عبر واتساب: +20 101 234 5678\n🕓 ساعات العمل: 9 صباحًا – 9 مساءً يوميًا.'
            : '📞 You can contact us via:\n- Email: support@aurastore.com\n- WhatsApp: +20 101 234 5678\n🕓 Working hours: 9 AM – 9 PM daily.'
        );
        suggestions = arabic
          ? ['اعرض المنتجات', 'اسعار المنتجات', 'وقت التوصيل']
          : ['Show products', 'Product prices', 'Delivery time'];

      } else {
        const productsFound = await Product.find({
          $or: [
            { name: { $regex: lowerPrompt, $options: 'i' } },
            { description: { $regex: lowerPrompt, $options: 'i' } }
          ]
        }).limit(5);

        if (productsFound.length > 0) {
          aiResponses.push(
            arabic
              ? '🔍 إليك المنتجات المشابهة التي وجدتها:'
              : '🔍 Here are similar products I found:'
          );
          productsFound.forEach(p => {
            aiResponses.push(
              arabic
                ? `- ${p.name} (${p.price} دولار)`
                : `- ${p.name} (${p.price} $)`
            );
          });
          suggestions = arabic
            ? ['وقت التوصيل', 'تكلفة الشحن', 'تواصل معنا']
            : ['Delivery time', 'Shipping cost', 'Contact us'];
        } else {
          aiResponses.push(
            arabic
              ? 'آسفة 😅 لم أجد هذا المنتج. يمكنك توضيح الاسم أكثر؟'
              : "Sorry 😅 I couldn't find that product. Could you clarify the name?"
          );
          suggestions = arabic
            ? ['اعرض المنتجات', 'اسعار المنتجات', 'وقت التوصيل']
            : ['Show products', 'Product prices', 'Delivery time'];
        }
      }
    }

    const chat = new Chat({ userMessage: prompt, aiResponse: aiResponses.join('\n') });
    await chat.save();

    res.json({ message: aiResponses.join('\n'), suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: arabic
        ? 'حدث خطأ أثناء معالجة الرسالة 😔'
        : 'An error occurred while processing your message 😔'
    });
  }
};

module.exports = { askAI };
