import { TestSuite, TestCase } from '@/types';
import { Button } from './ui/Button';
import { ArrowLeft, Edit, FolderOpen } from 'lucide-react';
import { TestCaseGrid } from './TestCaseGrid';

interface TestSuiteViewProps {
  testSuite: TestSuite;
  testCases: TestCase[];
  onBack: () => void;
  onEdit: () => void;
  onViewTestCase: (id: string) => void;
  onEditTestCase: (id: string) => void;
  onExecuteTestCase: (id: string) => void;
  onDeleteTestCase: (id: string) => void;
}

export function TestSuiteView({ 
  testSuite, 
  testCases, 
  onBack, 
  onEdit,
  onViewTestCase,
  onEditTestCase,
  onExecuteTestCase,
  onDeleteTestCase
}: TestSuiteViewProps) {
  const suiteCases = testCases.filter(tc => tc.testSuiteId === testSuite.id);

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
          </div>
        </div>
        <div className="flex gap-3">
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
            onAdd={() => {}} // Read-only grid in this view, or we can pass the real handlers if we want
            onUpdate={() => {}}
            onDelete={onDeleteTestCase}
            onView={onViewTestCase}
            onExecute={onExecuteTestCase}
          />
        </div>
      </div>
    </div>
  );
}
