"use server";

export async function summarizeSnippet(code: string) {
  console.log("CHECKING GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Key exists (starts with " + process.env.GROQ_API_KEY.slice(0, 5) + "...)" : "UNDEFINED/EMPTY");

  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_key")) {
      return {
        summary: "AI Auto-summary (Mocked: Add GROQ_API_KEY in .env.local for live generation).",
        category: "General",
      };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", // Active Groq-supported model
        messages: [
          {
            role: "system",
            content: "You are a code analyzer. Respond strictly with raw JSON containing 'summary' (1-sentence description) and 'category' (one word like Frontend, Backend, Database, DevOps, Utility). No markdown formatting or backticks.",
          },
          {
            role: "user",
            content: code,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API Error Response:", errText);
      throw new Error(`Groq API failed with status ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";

    const cleanedText = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleanedText;

    const parsed = JSON.parse(jsonString);

    return {
      summary: parsed.summary || "Custom code snippet.",
      category: parsed.category || "Development",
    };
  } catch (error) {
    console.error("AI Generation Error Details:", error);
    return {
      summary: "Failed to generate AI summary.",
      category: "Snippet",
    };
  }
}