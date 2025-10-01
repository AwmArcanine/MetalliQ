import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, BrainIcon } from '../../constants';
import type { ChatMessage, User, LcaReport, View, NewStudyFormState } from '../../types';
import { getAIChatResponse } from '../../services/geminiService';

interface AIAssistantProps {
    currentUser: User;
    allReports: LcaReport[];
    currentReport: LcaReport | null;
    currentView: View;
    newStudyFormData?: NewStudyFormState;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ currentUser, allReports, currentReport, currentView, newStudyFormData }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const getInitialMessage = (role: 'user' | 'admin') => {
        return role === 'admin'
            ? "Hello, Admin. I'm ready to provide system-level insights. Ask about user trends, datasets, or model status."
            : "Hello! As your AI Advisor, I can help you analyze your LCA data. How can I assist you today?";
    };
        
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: getInitialMessage(currentUser.role) }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    // Reset initial message if user changes (e.g., on logout/login)
    useEffect(() => {
        setMessages([{ role: 'assistant', content: getInitialMessage(currentUser.role) }]);
    }, [currentUser.role]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await getAIChatResponse(inputValue, {
                currentUser,
                allReports,
                currentReport,
                currentView,
                newStudyFormData,
            });
            const assistantMessage: ChatMessage = { role: 'assistant', content: response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error("AI chat failed:", error);
            let errorMessageContent = 'Sorry, I encountered an error. Please try again.';
            if (error.message === 'API_KEY_MISSING') {
                errorMessageContent = "I am unable to connect to the AI service. The required API key has not been configured in the application's environment. Please contact an administrator to resolve this issue.";
            } else if (error.message && (error.message.toLowerCase().includes('api key not valid') || error.message.toLowerCase().includes('permission denied') || error.message.toLowerCase().includes('api_key_invalid'))) {
                errorMessageContent = "AI Assistant Failed: The provided API key is invalid. For local development, please ensure your environment variables are correctly loaded and the key is valid.";
            }
            const errorMessage: ChatMessage = { role: 'assistant', content: errorMessageContent };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const placeholderText = currentUser.role === 'admin' ? "Ask about trends, datasets..." : "Ask about reports, terms...";


    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-secondary)] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform transform focus:outline-none z-50 glowing-fab"
                aria-label="Open AI Advisor"
            >
                <ChatBubbleLeftRightIcon className="w-8 h-8" />
            </button>

            {isOpen && (
                <div className="fixed bottom-0 right-0 w-full h-full sm:bottom-24 sm:right-8 sm:w-full sm:max-w-md sm:h-[60vh] bg-[var(--color-light)] rounded-none sm:rounded-xl shadow-2xl flex flex-col z-50 border border-black/10">
                    <div className="flex justify-between items-center p-4 border-b border-black/10 bg-[var(--color-secondary)] sm:rounded-t-xl">
                        <h3 className="font-semibold text-lg text-[var(--text-on-dark-primary)]">AI Advisor</h3>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white text-2xl" aria-label="Close AI Advisor">&times;</button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0"><BrainIcon className="w-5 h-5 text-white" /></div>}
                                <div className={`max-w-xs md:max-w-sm rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-[var(--color-secondary)] text-[var(--text-on-dark-primary)]' : 'bg-white text-[var(--text-on-light-primary)] border border-gray-300'}`}>
                                    <div className="text-sm" style={{whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-start gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0"><BrainIcon className="w-5 h-5 text-white" /></div>
                                <div className="max-w-xs md:max-w-sm rounded-xl px-4 py-3 bg-white text-[var(--text-on-light-primary)] border border-gray-300">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-black/10 bg-white sm:rounded-b-xl">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={placeholderText}
                                className="flex-1 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-secondary)]"
                                disabled={isLoading}
                                aria-label="Chat input"
                            />
                            <button type="submit" className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded-md hover:opacity-80 disabled:bg-gray-400" disabled={isLoading || !inputValue.trim()}>
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;