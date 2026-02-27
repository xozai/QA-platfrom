import { useState } from 'react';
import { TestCase, TestStatus } from '@/types';
import { Button } from './ui/Button';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, SkipForward, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestCaseExecutionProps {
  testCase: TestCase;
  onBack: () => void;
  onSaveResult: (id: string, status: TestStatus) => void;
}

export function TestCaseExecution({ testCase, onBack, onSaveResult }: TestCaseExecutionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState<Record<string, 'pass' | 'fail' | null>>(
    testCase.steps.reduce((acc, step) => ({ ...acc, [step.id]: null }), {})
  );
  const [overallStatus, setOverallStatus] = useState<TestStatus>(testCase.status);

  const handleStepResult = (stepId: string, result: 'pass' | 'fail') => {
    setStepResults(prev => ({ ...prev, [stepId]: result }));
    if (currentStepIndex < testCase.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSave = () => {
    onSaveResult(testCase.id, overallStatus);
    onBack();
  };

  const allStepsCompleted = Object.values(stepResults).every(res => res !== null);
  const anyStepFailed = Object.values(stepResults).some(res => res === 'fail');

  // Auto-suggest status based on steps
  if (allStepsCompleted && overallStatus === 'Untested') {
    if (anyStepFailed) setOverallStatus('Fail');
    else setOverallStatus('Pass');
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">Execution Mode</span>
              <span className="text-sm font-mono text-zinc-500">{testCase.testCaseId}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{testCase.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm">
            <span className="text-sm font-medium text-zinc-500">Overall Status:</span>
            <select 
              value={overallStatus}
              onChange={(e) => setOverallStatus(e.target.value as TestStatus)}
              className={cn(
                "text-sm font-bold bg-transparent border-none focus:ring-0 cursor-pointer outline-none",
                overallStatus === 'Pass' ? 'text-emerald-600' :
                overallStatus === 'Fail' ? 'text-red-600' :
                overallStatus === 'Blocked' ? 'text-amber-600' :
                overallStatus === 'Skipped' ? 'text-zinc-600' :
                'text-zinc-900'
              )}
            >
              <option value="Untested">Untested</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Blocked">Blocked</option>
              <option value="Skipped">Skipped</option>
            </select>
          </div>
          <Button onClick={handleSave} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Save className="w-4 h-4" /> Save Execution
          </Button>
        </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Left column: Context */}
        <div className="w-1/3 space-y-6 overflow-y-auto pr-2 pb-8">
          {testCase.preconditions && (
            <section className="bg-amber-50 p-5 rounded-xl border border-amber-200/50">
              <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Preconditions
              </h2>
              <p className="text-sm text-amber-800 whitespace-pre-wrap">{testCase.preconditions}</p>
            </section>
          )}

          {testCase.testData && (
            <section className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Test Data</h2>
              <p className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">{testCase.testData}</p>
            </section>
          )}
          
          <section className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Progress</h2>
            <div className="space-y-3">
              {testCase.steps.map((step, idx) => (
                <div 
                  key={step.id} 
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    currentStepIndex === idx ? "bg-indigo-50 border border-indigo-100" : "hover:bg-zinc-50",
                    stepResults[step.id] === 'pass' && currentStepIndex !== idx ? "opacity-60" : ""
                  )}
                  onClick={() => setCurrentStepIndex(idx)}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                    stepResults[step.id] === 'pass' ? "bg-emerald-100 text-emerald-700" :
                    stepResults[step.id] === 'fail' ? "bg-red-100 text-red-700" :
                    currentStepIndex === idx ? "bg-indigo-600 text-white" :
                    "bg-zinc-100 text-zinc-500"
                  )}>
                    {stepResults[step.id] === 'pass' ? <CheckCircle2 className="w-4 h-4" /> :
                     stepResults[step.id] === 'fail' ? <XCircle className="w-4 h-4" /> :
                     idx + 1}
                  </div>
                  <span className={cn(
                    "text-sm truncate",
                    currentStepIndex === idx ? "font-semibold text-indigo-900" : "text-zinc-600"
                  )}>
                    Step {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column: Active Step */}
        <div className="w-2/3 flex flex-col bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Step {currentStepIndex + 1} of {testCase.steps.length}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentStepIndex(prev => Math.min(testCase.steps.length - 1, prev + 1))}
                disabled={currentStepIndex === testCase.steps.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Action to Perform</h3>
              <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-xl text-lg text-indigo-950 whitespace-pre-wrap leading-relaxed">
                {testCase.steps[currentStepIndex].action}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Expected Result</h3>
              <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-xl text-lg text-emerald-950 whitespace-pre-wrap leading-relaxed">
                {testCase.steps[currentStepIndex].expectedResult}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-100 bg-zinc-50/80 flex justify-center gap-6">
            <Button 
              size="lg" 
              variant="outline"
              className={cn(
                "w-48 gap-3 border-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all",
                stepResults[testCase.steps[currentStepIndex].id] === 'fail' ? "bg-red-50 text-red-700 border-red-500" : ""
              )}
              onClick={() => handleStepResult(testCase.steps[currentStepIndex].id, 'fail')}
            >
              <XCircle className="w-5 h-5" /> Fail Step
            </Button>
            <Button 
              size="lg" 
              className={cn(
                "w-48 gap-3 border-2 transition-all",
                stepResults[testCase.steps[currentStepIndex].id] === 'pass' 
                  ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600" 
                  : "bg-white text-zinc-900 border-zinc-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
              )}
              onClick={() => handleStepResult(testCase.steps[currentStepIndex].id, 'pass')}
            >
              <CheckCircle2 className="w-5 h-5" /> Pass Step
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
