import { useState } from 'react';
import { TestSuite, TestCase } from '@/types';
import { Button } from './ui/Button';
import { Edit, Eye, Trash2, FolderOpen, Link, EyeOff, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestSuiteListProps {
  testSuites: TestSuite[];
  testCases: TestCase[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

export function TestSuiteList({ testSuites, testCases, onView, onEdit, onDelete, onToggleVisibility }: TestSuiteListProps) {
  const [showHidden, setShowHidden] = useState(false);

  const copySuiteLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}?suiteId=${id}`;
    navigator.clipboard.writeText(url);
    alert('Suite link copied to clipboard!');
  };

  const exportToCSV = (suite: TestSuite) => {
    const suiteCases = testCases.filter(tc => tc.testSuiteId === suite.id);
    if (suiteCases.length === 0) {
      alert('No test cases to export in this suite.');
      return;
    }

    const headers = ['ID', 'Title', 'Priority', 'QA Status', 'UAT Status', 'BAT Status', 'Description', 'Steps'];
    const rows = suiteCases.map(tc => [
      tc.testCaseId,
      tc.title,
      tc.priority,
      tc.qaStatus,
      tc.uatStatus,
      tc.batStatus,
      tc.description.replace(/"/g, '""'),
      tc.steps.map((s, i) => `${i + 1}. ${s.action}`).join('; ').replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${suite.name.replace(/\s+/g, '_')}_test_cases.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSuites = testSuites.filter(s => showHidden || !s.isHidden);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Test Suites</h1>
          <p className="text-zinc-500 mt-2">Group and manage related test cases.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowHidden(!showHidden)}
          className={cn("gap-2", showHidden && "bg-zinc-100 border-zinc-300")}
        >
          {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showHidden ? 'Hide Hidden Suites' : 'Show Hidden Suites'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuites.map((suite) => {
          const suiteCases = testCases.filter(tc => tc.testSuiteId === suite.id);
          const passed = suiteCases.filter(tc => tc.qaStatus === 'Pass').length;
          const failed = suiteCases.filter(tc => tc.qaStatus === 'Fail').length;
          const total = suiteCases.length;
          
          return (
            <div 
              key={suite.id} 
              className={cn(
                "bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col transition-opacity",
                suite.isHidden && "opacity-60 grayscale-[0.5]"
              )}
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    suite.isHidden ? "bg-zinc-100 text-zinc-400" : "bg-indigo-50 text-indigo-600"
                  )}>
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => exportToCSV(suite)} title="Export CSV">
                      <Download className="w-4 h-4 text-zinc-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copySuiteLink(suite.id)} title="Copy Link">
                      <Link className="w-4 h-4 text-zinc-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onToggleVisibility(suite.id)} title={suite.isHidden ? "Unhide" : "Hide"}>
                      {suite.isHidden ? <Eye className="w-4 h-4 text-indigo-600" /> : <EyeOff className="w-4 h-4 text-zinc-500" />}
                    </Button>
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
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-zinc-900 truncate">{suite.name}</h3>
                  {suite.isHidden && <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-bold uppercase">Hidden</span>}
                </div>
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
                {suite.jiraNumber && <span className="font-mono">{suite.jiraNumber}</span>}
              </div>
            </div>
          );
        })}
        {filteredSuites.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 bg-white rounded-xl border border-zinc-200 border-dashed">
            <FolderOpen className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
            <p>No test suites found. Create one to organize your test cases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
