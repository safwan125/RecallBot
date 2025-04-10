// flash_client.js

const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
const GOOGLE_API_KEY = "AIzaSyBatHzHo6JwC4gJY198p1pIBS1jWU4Ud5A"; // <-- Replace with your actual key

const flashcardKeywords = ["flashcard", "study", "revise", "topic", "generate", "summarize"];

function showLoading(state) {
  const loadingDiv = document.getElementById("loading");
  if (loadingDiv) {
    loadingDiv.style.display = state ? "block" : "none";
  }
}

async function getFlashcardResponse(message) {
  // Always generate flashcards regardless of keywords
  const isFlashcardQuery = true;

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
    contents: [{ 
      role: "user",
      parts: [{ text: prompt }] 
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      return `Error: ${errorData.error?.message || `Status code: ${response.status}`}`;
    }

    const data = await response.json();
    showLoading(false);
    window.lastGeminiResponse = data; // ✅ This makes the response accessible from browser console
    console.log("🔥 Gemini Full Response:", data); // ✅ For visual check in the console

    // Handle error responses from the API
    if (data.error) {
      console.error("API Error:", data.error);
      return `Error: ${data.error.message || "Unknown error occurred"}`;
    }

    // Extract text from the API response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content;
      if (content.parts && content.parts.length > 0 && content.parts[0].text) {
        return content.parts[0].text;
      }
    }
    
    // If we couldn't extract the text through the expected path
    return "Sorry, I couldn't generate flashcards. The API response format was unexpected.";
  } catch (error) {
    console.error("API Error:", error);
    showLoading(false);
    return "Error connecting to the AI service. Please check your internet connection and try again.";
  }
}
