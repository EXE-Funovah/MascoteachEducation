/**
 * Mascoteach — Mascot Chat Service
 * Handles AI chat interactions for the mascot assistant.
 * Uses the AI Module at ai.mascoteach.com
 *
 * NOTE: If your AI backend doesn't have a /chat endpoint yet,
 * this provides a graceful fallback with canned responses.
 */

const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://ai.mascoteach.com';

/**
 * Send a chat message to the AI mascot and get a response.
 *
 * @param {string} message — User's message
 * @param {Array<{role: string, content: string}>} history — Chat history for context
 * @returns {Promise<string>} — AI response text
 */
export async function sendMascotMessage(message, history = []) {
    try {
        const res = await fetch(`${AI_BASE_URL}/api/v1/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                history,
            }),
        });

        if (!res.ok) {
            throw new Error(`AI responded with status ${res.status}`);
        }

        const data = await res.json();
        return data.reply || data.message || data.data?.reply || 'Hmm, I didn\'t quite get that. Try again?';
    } catch (error) {
        console.warn('Mascot chat API error, using fallback:', error.message);
        return getFallbackResponse(message);
    }
}

/**
 * Fallback responses when the AI endpoint is unavailable.
 * Groups responses by detected intent for a more natural feel.
 */
function getFallbackResponse(message) {
    const lower = message.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('xin chào')) {
        return 'Hey there! 👋 I\'m your Mascoteach assistant! I can help you navigate the platform, explain features, or just chat. What would you like to know?';
    }
    if (lower.includes('quiz') || lower.includes('question')) {
        return 'Want to create a quiz? Head over to the Library page, upload a document, and I\'ll help generate questions automatically! 📝';
    }
    if (lower.includes('help')) {
        return 'I\'m here to help! You can ask me about creating quizzes, managing sessions, or navigating the platform. What do you need? 🤔';
    }
    if (lower.includes('game') || lower.includes('play')) {
        return 'Games are a great way to learn! Once you\'ve created a quiz, you can select a game template and start a live session for your students. 🎮';
    }
    if (lower.includes('thank')) {
        return 'You\'re welcome! Always happy to help! 😊 Let me know if you need anything else.';
    }

    const genericResponses = [
        'That\'s interesting! Tell me more about what you\'re working on. 🌟',
        'I\'m still learning, but I\'m here to help with anything about Mascoteach! 💡',
        'Great question! Feel free to explore the platform — I\'ll be right here if you need me. 🎯',
        'I love chatting! Ask me about quizzes, sessions, or anything else on the platform. 📚',
    ];

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}
