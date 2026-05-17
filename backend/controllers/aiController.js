const Groq = require("groq-sdk");

const generateEventDescription = async (req, res) => {
  const { title, category } = req.body;

  if (!title || !category) {
    return res.status(400).json({ message: "Title and Category are required" });
  }

  const fallbackDescription = `📌 Join us for "${title}" (${category})! 🎉

Get ready for an exciting college event filled with learning, fun, and networking 🤝✨
✅ Open for all students
📍 Don’t miss it — register now! 🚀`;

  if (!process.env.GROQ_API_KEY) {
    return res.status(200).json({ description: fallbackDescription });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a professional college event organizer.
Write a catchy and engaging event description (50-80 words).
Use simple student-friendly language and add emojis.

Event Title: ${title}
Category: ${category}
Target Audience: College Students`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ FIXED MODEL
      messages: [
        { role: "system", content: "You write high-quality event descriptions." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 160,
    });

    const description =
      response.choices?.[0]?.message?.content?.trim() || fallbackDescription;

    return res.status(200).json({ description });
  } catch (error) {
    console.log("❌ GROQ ERROR:", error.message);

    return res.status(200).json({
      description: fallbackDescription,
      note: "Groq failed, fallback used ✅",
    });
  }
};

module.exports = { generateEventDescription };
