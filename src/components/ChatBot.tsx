import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '@/lib/utils';
import { TestCase, TestSuite } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  testSuites: TestSuite[];
  onAddTestSuite: (suite: Omit<TestSuite, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddTestCase: (testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function ChatBot({ testSuites, onAddTestSuite, onAddTestCase }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your QA Assistant. I can help you create test suites and test cases. Just tell me what you'd like to build!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createTestSuiteDecl: FunctionDeclaration = {
    name: "createTestSuite",
    parameters: {
      type: Type.OBJECT,
      description: "Creates a new test suite to group related test cases.",
      properties: {
        name: { type: Type.STRING, description: "The name of the test suite." },
        description: { type: Type.STRING, description: "A brief description of the test suite." },
      },
      required: ["name", "description"],
    },
  };

  const createTestCaseDecl: FunctionDeclaration = {
    name: "createTestCase",
    parameters: {
      type: Type.OBJECT,
      description: "Creates a new test case with detailed steps.",
      properties: {
        testCaseId: { type: Type.STRING, description: "A unique identifier for the test case (e.g., TC-001)." },
        title: { type: Type.STRING, description: "The title of the test case." },
        description: { type: Type.STRING, description: "A description of the test case." },
        preconditions: { type: Type.STRING, description: "Conditions that must be met before running the test." },
        testData: { type: Type.STRING, description: "Specific data required for the test." },
        priority: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "The priority of the test case." },
        testSuiteId: { type: Type.STRING, description: "Optional ID of the test suite to associate this case with." },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING, description: "The action to perform in this step." },
              expectedResult: { type: Type.STRING, description: "The expected outcome of this step." },
            },
            required: ["action", "expectedResult"],
          },
          description: "A list of steps to execute the test.",
        },
      },
      required: ["testCaseId", "title", "description", "priority", "steps"],
    },
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-pro-preview";

      const response = await ai.models.generateContent({
        model,
        contents: messages.concat({ role: 'user', content: userMessage }).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `You are a professional QA engineer assistant. 
          Your goal is to help users manage their test suite and test cases.
          You can create test suites and test cases using the provided tools.
          When a user describes a feature or a test scenario, suggest creating a test case or a suite.
          Available Test Suites: ${JSON.stringify(testSuites.map(s => ({ id: s.id, name: s.name })))}.
          If the user wants to add a test case to an existing suite, use the correct testSuiteId.
          Always confirm with the user before performing actions, or perform them if they are explicitly requested.`,
          tools: [{ functionDeclarations: [createTestSuiteDecl, createTestCaseDecl] }],
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'createTestSuite') {
            const args = call.args as any;
            onAddTestSuite({
              name: args.name,
              description: args.description,
            });
            setMessages(prev => [...prev, { role: 'assistant', content: `I've created the test suite "${args.name}" for you.` }]);
          } else if (call.name === 'createTestCase') {
            const args = call.args as any;
            onAddTestCase({
              testCaseId: args.testCaseId,
              title: args.title,
              description: args.description,
              preconditions: args.preconditions || '',
              testData: args.testData || '',
              priority: args.priority,
              relatedRequirements: '',
              testSuiteId: args.testSuiteId,
              qaStatus: 'Untested',
              uatStatus: 'Untested',
              batStatus: 'Untested',
              steps: args.steps.map((s: any) => ({ ...s, id: crypto.randomUUID() })),
            });
            setMessages(prev => [...prev, { role: 'assistant', content: `I've created the test case "${args.title}" (${args.testCaseId}) for you.` }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I'm not sure how to help with that." }]);
      }
    } catch (error) {
      console.error("ChatBot Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50",
          isOpen ? "bg-zinc-800 rotate-90" : "bg-indigo-600 hover:bg-indigo-700"
        )}
      >
        {isOpen ? <X className="text-white w-6 h-6" /> : <MessageSquare className="text-white w-6 h-6" />}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col transition-all duration-300 z-50 overflow-hidden",
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">QA AI Assistant</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Online</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                msg.role === 'assistant' ? "bg-indigo-100 text-indigo-600" : "bg-zinc-200 text-zinc-600"
              )}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-sm shadow-sm",
                msg.role === 'assistant' 
                  ? "bg-white text-zinc-800 rounded-tl-none border border-zinc-100" 
                  : "bg-indigo-600 text-white rounded-tr-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-3 rounded-2xl text-sm bg-white text-zinc-800 rounded-tl-none border border-zinc-100 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-100 bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2 text-center">
            Powered by Gemini 3.1 Pro
          </p>
        </div>
      </div>
    </>
  );
}
