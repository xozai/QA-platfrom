import { TestSuite, TestCase, User, TestStep } from '@/types';
import { Button } from './ui/Button';
import { ArrowLeft, Edit, FolderOpen, Link, Download, Upload, Sparkles } from 'lucide-react';
import { TestCaseGrid } from './TestCaseGrid';
import Papa from 'papaparse';
import { useRef, ChangeEvent, useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SuggestedTestCasesModal } from './SuggestedTestCasesModal';

interface SuggestedTestCase {
  testCaseId: string;
  title: string;
  description: string;
  preconditions: string;
  testData: string;
  priority: 'High' | 'Medium' | 'Low';
  steps: Omit<TestStep, 'id'>[];
}

interface TestSuiteViewProps {
  testSuite: TestSuite;
  testCases: TestCase[];
  users: User[];
  onBack: () => void;
  onEdit: () => void;
  onCopyTestCase: (id: string) => void;
  onViewTestCase: (id: string) => void;
  onEditTestCase: (id: string) => void;
  onExecuteTestCase: (id: string) => void;
  onDeleteTestCase: (id: string) => void;
  onAddTestCase: (data: Partial<TestCase>) => void;
}

export function TestSuiteView({ 
  testSuite, 
  testCases, 
  users,
  onBack, 
  onEdit,
  onCopyTestCase,
  onViewTestCase,
  onEditTestCase,
  onExecuteTestCase,
  onDeleteTestCase,
  onAddTestCase
}: TestSuiteViewProps) {
  const suiteCases = testCases.filter(tc => tc.testSuiteId === testSuite.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedTestCase[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggestTestCases = async () => {
    setIsSuggesting(true);
    setIsSuggestModalOpen(true);
    setSuggestions([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-pro-preview";

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{
              text: `Based on the following existing test cases in the test suite "${testSuite.name}" (${testSuite.description}), suggest 5 new, unique, and relevant test cases. 
              Existing Test Cases: ${JSON.stringify(suiteCases.map(tc => ({ title: tc.title, description: tc.description })))}`
            }]
          }
        ],
        config: {
          systemInstruction: "You are a professional QA engineer. Suggest high-quality test cases in JSON format. Ensure they cover edge cases, negative scenarios, and typical user flows that might be missing.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                testCaseId: { type: Type.STRING, description: "A unique ID like TC-XXX" },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                preconditions: { type: Type.STRING },
                testData: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      action: { type: Type.STRING },
                      expectedResult: { type: Type.STRING }
                    },
                    required: ["action", "expectedResult"]
                  }
                }
              },
              required: ["testCaseId", "title", "description", "priority", "steps"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      setSuggestions(data);
    } catch (error) {
      console.error("Suggestion Error:", error);
      alert("Failed to get suggestions from Gemini. Please try again.");
      setIsSuggestModalOpen(false);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddSuggestions = (selected: SuggestedTestCase[]) => {
    selected.forEach(tc => {
      onAddTestCase({
        ...tc,
        testSuiteId: testSuite.id,
        qaStatus: 'Untested',
        uatStatus: 'Untested',
        batStatus: 'Untested',
        steps: tc.steps.map(s => ({ ...s, id: crypto.randomUUID() }))
      });
    });
  };

  const copySuiteLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?suiteId=${testSuite.id}`;
    navigator.clipboard.writeText(url);
    alert('Suite link copied to clipboard!');
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        ID: 'TC-001',
        Title: 'Example Test Case',
        Priority: 'Medium',
        Description: 'Enter description here',
        Preconditions: 'Enter preconditions here',
        TestData: 'Enter test data here',
        RelatedRequirements: 'REQ-001',
        Steps: 'Step 1 Action | Step 1 Expected Result || Step 2 Action | Step 2 Expected Result'
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `test_case_template_${testSuite.name.toLowerCase().replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedCases = results.data as any[];
        let count = 0;

        importedCases.forEach(row => {
          if (!row.Title) return;

          const steps = (row.Steps || '').split('||').map((s: string) => {
            const parts = s.split('|').map(part => part.trim());
            const action = parts[0] || '';
            const expectedResult = parts[1] || '';
            return {
              id: Math.random().toString(36).substr(2, 9),
              action: action,
              expectedResult: expectedResult
            };
          }).filter((s: any) => s.action || s.expectedResult);

          onAddTestCase({
            testCaseId: row.ID || `TC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            title: row.Title,
            priority: (row.Priority || 'Medium') as any,
            description: row.Description || '',
            preconditions: row.Preconditions || '',
            testData: row.TestData || '',
            relatedRequirements: row.RelatedRequirements || '',
            steps: steps,
            testSuiteId: testSuite.id,
            qaStatus: 'Untested',
            uatStatus: 'Untested',
            batStatus: 'Untested'
          });
          count++;
        });

        alert(`Successfully imported ${count} test cases.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-500">Test Suite</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{testSuite.name}</h1>
            {testSuite.jiraNumber && <span className="text-sm font-mono text-zinc-400">JIRA: {testSuite.jiraNumber}</span>}
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button 
            onClick={handleSuggestTestCases}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4" /> Suggest Cases
          </Button>
          <Button variant="outline" onClick={downloadTemplate} className="gap-2">
            <Download className="w-4 h-4" /> Download Template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button variant="outline" onClick={copySuiteLink} className="gap-2">
            <Link className="w-4 h-4" /> Copy Link
          </Button>
          <Button variant="outline" onClick={onEdit} className="gap-2">
            <Edit className="w-4 h-4" /> Edit Suite
          </Button>
        </div>
      </div>

      {testSuite.description && (
        <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Description</h2>
          <p className="text-zinc-700 whitespace-pre-wrap">{testSuite.description}</p>
        </section>
      )}

      <div className="pt-4 h-[600px]">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-4">Test Cases in this Suite</h2>
        <div className="-mx-8 h-full">
          <TestCaseGrid 
            testCases={suiteCases}
            testSuites={[testSuite]}
            users={users}
            onAdd={() => {}} 
            onUpdate={() => {}}
            onDelete={onDeleteTestCase}
            onCopy={onCopyTestCase}
            onView={onViewTestCase}
            onExecute={onExecuteTestCase}
            showHidden={true}
          />
        </div>
      </div>

      <SuggestedTestCasesModal 
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        suggestions={suggestions}
        isLoading={isSuggesting}
        onAddSelected={handleAddSuggestions}
      />
    </div>
  );
}
