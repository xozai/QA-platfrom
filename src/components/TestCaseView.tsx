import { TestCase } from '@/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ArrowLeft, Edit, Play } from 'lucide-react';

interface TestCaseViewProps {
  testCase: TestCase;
  onBack: () => void;
  onEdit: () => void;
  onExecute: () => void;
}

export function TestCaseView({ testCase, onBack, onEdit, onExecute }: TestCaseViewProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">{testCase.testCaseId}</span>
              <Badge variant={testCase.status === 'Pass' ? 'success' : testCase.status === 'Fail' ? 'destructive' : testCase.status === 'Blocked' ? 'warning' : 'outline'}>
                {testCase.status}
              </Badge>
              <Badge variant={testCase.priority === 'High' ? 'destructive' : testCase.priority === 'Medium' ? 'warning' : 'info'}>
                {testCase.priority} Priority
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{testCase.title}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onEdit} className="gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <Button onClick={onExecute} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Play className="w-4 h-4" /> Execute
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {testCase.description && (
            <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">Description</h2>
              <p className="text-zinc-700 whitespace-pre-wrap">{testCase.description}</p>
            </section>
          )}

          <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Test Steps</h2>
            <div className="space-y-6">
              {testCase.steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Action</h4>
                      <p className="text-zinc-900 bg-zinc-50 p-3 rounded-md border border-zinc-100 whitespace-pre-wrap">{step.action}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Expected Result</h4>
                      <p className="text-zinc-700 bg-emerald-50/50 p-3 rounded-md border border-emerald-100/50 whitespace-pre-wrap">{step.expectedResult}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {testCase.preconditions && (
            <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">Preconditions</h2>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap bg-zinc-50 p-3 rounded-md border border-zinc-100">{testCase.preconditions}</p>
            </section>
          )}

          {testCase.testData && (
            <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">Test Data</h2>
              <p className="text-sm font-mono text-zinc-700 whitespace-pre-wrap bg-zinc-900 text-zinc-300 p-4 rounded-md overflow-x-auto">{testCase.testData}</p>
            </section>
          )}

          {testCase.relatedRequirements && (
            <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">Related Requirements</h2>
              <div className="flex flex-wrap gap-2">
                {testCase.relatedRequirements.split(',').map((req, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {req.trim()}
                  </span>
                ))}
              </div>
            </section>
          )}
          
          <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm text-sm text-zinc-500 space-y-2">
            <div className="flex justify-between">
              <span>Created</span>
              <span className="font-medium text-zinc-900">{new Date(testCase.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span className="font-medium text-zinc-900">{new Date(testCase.updatedAt).toLocaleDateString()}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
