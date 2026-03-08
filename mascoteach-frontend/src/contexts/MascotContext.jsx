import { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * MascotContext — Global state for the interactive mascot assistant.
 * Persists across all pages when wrapped around <App />.
 *
 * Provides:
 *   - isOpen: whether the mascot chat panel is visible
 *   - isSpeaking: whether the mascot is currently "speaking" (awaiting AI response)
 *   - messages: chat history array [{role, content}]
 *   - toggleMascot, sendMessage, closeMascot, clearChat
 */

const MascotContext = createContext(null);

export function MascotProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi there! 👋 I\'m your Mascoteach buddy! Ask me anything about the platform, or just say hello!',
        },
    ]);

    // We'll keep a ref so the sendMessage function always has current messages
    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    const toggleMascot = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const openMascot = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeMascot = useCallback(() => {
        setIsOpen(false);
    }, []);

    const clearChat = useCallback(() => {
        setMessages([
            {
                role: 'assistant',
                content: 'Chat cleared! How can I help you? 🌟',
            },
        ]);
    }, []);

    const addMessage = useCallback((role, content) => {
        setMessages((prev) => [...prev, { role, content }]);
    }, []);

    const value = {
        isOpen,
        isSpeaking,
        messages,
        toggleMascot,
        openMascot,
        closeMascot,
        clearChat,
        addMessage,
        setIsSpeaking,
    };

    return (
        <MascotContext.Provider value={value}>
            {children}
        </MascotContext.Provider>
    );
}

/**
 * Custom hook to access mascot context
 */
export function useMascot() {
    const context = useContext(MascotContext);
    if (!context) {
        throw new Error('useMascot must be used within a MascotProvider');
    }
    return context;
}

export default MascotContext;
