// flash_client.js

const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
const GOOGLE_API_KEY = "AIzaSyCpZWDEu1vwySJ4Xps7ZU8x_eFS0tAvje4"; // <-- Replace with your actual key

const flashcardKeywords = ["flashcard", "study", "revise", "topic", "generate", "summarize"];

function showLoading(state) {
  const loadingDiv = document.getElementById("loading");
  if (loadingDiv) {
    loadingDiv.style.display = state ? "block" : "none";
  }
}

async function getFlashcardResponse(message) {
  const isFlashcardQuery = flashcardKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );

  if (!isFlashcardQuery) {
    return "Out of scope.";
  }

  const prompt = `
You are an AI that creates exactly 5 flashcards (Q&A) for study purposes on any given topic.
Format strictly as:
1. Question
Answer: ...
2. Question
Answer: ...
Only output the flashcards. Topic: ${message}
`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  });

  try {
    showLoading(true);
    const response = await fetch(`${API_URL}?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body
    });

    const data = await response.json();
    showLoading(false);
    window.lastGeminiResponse = data; // ✅ This makes the response accessible from browser console
    console.log("🔥 Gemini Full Response:", data); // ✅ For visual check in the console

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      const part = data.candidates[0].content.parts[0];

      if (typeof part === "string") {
        return part;
      }

      if (part.text) {
        return part.text;
      }

      // Fallback: show raw part object for debugging
      return JSON.stringify(part);
    } else {
      return "Sorry, I couldn't generate flashcards.";
    }
  } catch (error) {
    console.error("API Error:", error);
    showLoading(false);
    return "Error connecting to the AI service.";
  }
}
