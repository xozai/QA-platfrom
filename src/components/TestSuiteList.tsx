import { TestSuite, TestCase } from '@/types';
import { Button } from './ui/Button';
import { Edit, Eye, Trash2, FolderOpen } from 'lucide-react';

interface TestSuiteListProps {
  testSuites: TestSuite[];
  testCases: TestCase[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TestSuiteList({ testSuites, testCases, onView, onEdit, onDelete }: TestSuiteListProps) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Test Suites</h1>
          <p className="text-zinc-500 mt-2">Group and manage related test cases.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testSuites.map((suite) => {
          const suiteCases = testCases.filter(tc => tc.testSuiteId === suite.id);
          const passed = suiteCases.filter(tc => tc.status === 'Pass').length;
          const failed = suiteCases.filter(tc => tc.status === 'Fail').length;
          const total = suiteCases.length;
          
          return (
            <div key={suite.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onView(suite.id)} title="View">
                      <Eye className="w-4 h-4 text-zinc-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(suite.id)} title="Edit">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(suite.id)} title="Delete">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{suite.name}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{suite.description || 'No description provided.'}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-zinc-500">Total Cases</span>
                    <span className="font-semibold text-zinc-900">{total}</span>
                  </div>
                  <div className="w-px h-8 bg-zinc-200"></div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500">Passed</span>
                    <span className="font-semibold text-emerald-600">{passed}</span>
                  </div>
                  <div className="w-px h-8 bg-zinc-200"></div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500">Failed</span>
                    <span className="font-semibold text-red-600">{failed}</span>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-100 text-xs text-zinc-500 flex justify-between">
                <span>Updated {new Date(suite.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
        {testSuites.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 bg-white rounded-xl border border-zinc-200 border-dashed">
            <FolderOpen className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
            <p>No test suites found. Create one to organize your test cases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
