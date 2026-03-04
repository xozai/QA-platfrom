import React, { useState } from 'react';
import { TestCase, TestStep } from '@/types';
import { Button } from './ui/Button';
import { X, Sparkles, Plus, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestedTestCase {
  testCaseId: string;
  title: string;
  description: string;
  preconditions: string;
  testData: string;
  priority: 'High' | 'Medium' | 'Low';
  steps: Omit<TestStep, 'id'>[];
}

interface SuggestedTestCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: SuggestedTestCase[];
  onAddSelected: (selected: SuggestedTestCase[]) => void;
  isLoading: boolean;
}

export function SuggestedTestCasesModal({ 
  isOpen, 
  onClose, 
  suggestions, 
  onAddSelected,
  isLoading 
}: SuggestedTestCasesModalProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const handleAdd = () => {
    const selected = suggestions.filter((_, i) => selectedIndices.includes(i));
    onAddSelected(selected);
    onClose();
    setSelectedIndices([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI Suggested Test Cases</h2>
              <p className="text-zinc-400 text-xs">Gemini analyzed your suite and found these gaps</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <p className="text-zinc-500 font-medium">Gemini is brainstorming new scenarios...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-500">No suggestions available. Try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  onClick={() => toggleSelection(index)}
                  className={cn(
                    "group relative bg-white p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                    selectedIndices.includes(index) 
                      ? "border-indigo-500 bg-indigo-50/30 shadow-sm" 
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded uppercase tracking-wider">
                          {suggestion.testCaseId}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
                          suggestion.priority === 'High' ? "bg-red-100 text-red-600" :
                          suggestion.priority === 'Medium' ? "bg-amber-100 text-amber-600" :
                          "bg-emerald-100 text-emerald-600"
                        )}>
                          {suggestion.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 mb-1">{suggestion.title}</h3>
                      <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{suggestion.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Steps ({suggestion.steps.length})</h4>
                        <div className="space-y-1">
                          {suggestion.steps.slice(0, 2).map((step, i) => (
                            <div key={i} className="flex gap-2 text-xs text-zinc-500">
                              <span className="font-bold text-indigo-600">{i + 1}.</span>
                              <span className="line-clamp-1">{step.action}</span>
                            </div>
                          ))}
                          {suggestion.steps.length > 2 && (
                            <p className="text-[10px] text-zinc-400 italic">+{suggestion.steps.length - 2} more steps...</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedIndices.includes(index)
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-zinc-200 text-transparent group-hover:border-zinc-300"
                    )}>
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 bg-white flex items-center justify-between">
          <p className="text-sm text-zinc-500 font-medium">
            {selectedIndices.length} test cases selected
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={selectedIndices.length === 0 || isLoading}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Add Selected Cases
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
