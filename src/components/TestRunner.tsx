import React, { useState } from 'react';
import { TestSuite, TestCase, TestStatus, User, TesterRole } from '@/types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { CheckCircle2, XCircle, AlertCircle, User as UserIcon, FolderOpen, Search, ChevronLeft, Play, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestCaseExecution } from './TestCaseExecution';

interface TestRunnerProps {
  testSuites: TestSuite[];
  testCases: TestCase[];
  users: User[];
  onUpdateTestCase: (id: string, updates: Partial<TestCase>) => void;
}

type RunnerStep = 'suites' | 'executor' | 'grid' | 'view' | 'execute';

export function TestRunner({ testSuites, testCases, users, onUpdateTestCase }: TestRunnerProps) {
  const [step, setStep] = useState<RunnerStep>('suites');
  const [selectedSuiteIds, setSelectedSuiteIds] = useState<string[]>([]);
  const [executorId, setExecutorId] = useState('');
  const [testerRole, setTesterRole] = useState<TesterRole>('QA tester');
  const [executingCaseId, setExecutingCaseId] = useState<string | null>(null);
  const [viewingCaseId, setViewingCaseId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

  const toggleSuite = (id: string) => {
    setSelectedSuiteIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const activeCases = testCases.filter(tc => tc.testSuiteId && selectedSuiteIds.includes(tc.testSuiteId));
  const selectedExecutor = users.find(u => u.id === executorId);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedCases = [...activeCases].sort((a, b) => {
    if (!sortConfig.direction || !sortConfig.key) return 0;
    
    const aVal = (a as any)[sortConfig.key] || '';
    const bVal = (b as any)[sortConfig.key] || '';
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusForRole = (tc: TestCase) => {
    if (testerRole === 'QA tester') return tc.qaStatus;
    if (testerRole === 'UAT tester') return tc.uatStatus;
    if (testerRole === 'BAT tester') return tc.batStatus;
    return 'Untested';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pass': return <Badge variant="success">Pass</Badge>;
      case 'Fail': return <Badge variant="destructive">Fail</Badge>;
      case 'Blocked': return <Badge variant="warning">Blocked</Badge>;
      case 'Skipped': return <Badge variant="secondary">Skipped</Badge>;
      default: return <Badge variant="outline">Untested</Badge>;
    }
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  if (step === 'suites') {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Execute Tests</h1>
          <p className="text-zinc-500 mt-2">Step 1: Select the test suites you want to execute.</p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4" /> Available Suites ({testSuites.filter(s => !s.isHidden).length})
            </h2>
            <span className="text-xs text-zinc-500">{selectedSuiteIds.length} selected</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSuites.filter(s => !s.isHidden).map(suite => (
              <label 
                key={suite.id} 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all",
                  selectedSuiteIds.includes(suite.id) 
                    ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" 
                    : "bg-white border-zinc-100 hover:border-zinc-200"
                )}
              >
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  checked={selectedSuiteIds.includes(suite.id)}
                  onChange={() => toggleSuite(suite.id)}
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-zinc-900 truncate">{suite.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    {suite.jiraNumber && <span className="text-[10px] text-zinc-400 font-mono bg-zinc-100 px-1.5 py-0.5 rounded">{suite.jiraNumber}</span>}
                    <span className="text-[10px] text-zinc-400">{testCases.filter(tc => tc.testSuiteId === suite.id).length} cases</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
            <Button 
              onClick={() => setStep('executor')} 
              disabled={selectedSuiteIds.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              Next: Assign Executor <ChevronLeft className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'executor') {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStep('suites')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Assign Executor</h1>
            <p className="text-zinc-500 mt-2">Step 2: Assign an executor and select the tester role.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Select Executor
            </label>
            <select
              value={executorId}
              onChange={e => setExecutorId(e.target.value)}
              className="w-full h-12 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-base focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Select Tester Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['QA tester', 'UAT tester', 'BAT tester'] as TesterRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => setTesterRole(role)}
                  className={cn(
                    "px-4 py-4 rounded-xl text-sm font-bold transition-all border-2",
                    testerRole === role 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" 
                      : "bg-white text-zinc-600 border-zinc-100 hover:border-zinc-200"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-400 italic">
              You will be updating the <strong>{testerRole.split(' ')[0]}</strong> status for the selected test cases.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              onClick={() => setStep('grid')} 
              disabled={!executorId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 rounded-xl gap-2"
            >
              Start Execution <Play className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'grid') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 h-full flex flex-col">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setStep('executor')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Execution Grid</h1>
              <p className="text-zinc-500 mt-1">
                Executing {activeCases.length} cases as <span className="font-bold text-zinc-900">{selectedExecutor?.name}</span> ({testerRole})
              </p>
            </div>
          </div>
          <div className="flex gap-4 bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
            <div className="text-center px-4 border-r border-zinc-100">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Total</div>
              <div className="text-xl font-bold">{activeCases.length}</div>
            </div>
            <div className="text-center px-4">
              <div className="text-[10px] uppercase font-bold text-emerald-500">{testerRole.split(' ')[0]} Pass</div>
              <div className="text-xl font-bold text-emerald-600">
                {activeCases.filter(c => getStatusForRole(c) === 'Pass').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-50 border-b border-zinc-200 z-10">
                <tr>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900" onClick={() => handleSort('testCaseId')}>
                    <div className="flex items-center gap-2">ID {renderSortIcon('testCaseId')}</div>
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-2">Title {renderSortIcon('title')}</div>
                  </th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Executor</th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status ({testerRole.split(' ')[0]})</th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sortedCases.map(tc => (
                  <tr key={tc.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 text-sm font-mono text-zinc-500">{tc.testCaseId}</td>
                    <td className="p-4 text-sm font-medium text-zinc-900 max-w-xs truncate">{tc.title}</td>
                    <td className="p-4 text-sm text-zinc-600">{selectedExecutor?.name}</td>
                    <td className="p-4 text-sm text-zinc-600">{testerRole}</td>
                    <td className="p-4">{getStatusBadge(getStatusForRole(tc))}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-zinc-600 hover:bg-zinc-100 gap-2"
                          onClick={() => {
                            setViewingCaseId(tc.id);
                            setStep('view');
                          }}
                        >
                          <Eye className="w-4 h-4" /> View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600 hover:bg-indigo-50 gap-2"
                          onClick={() => {
                            setExecutingCaseId(tc.id);
                            setStep('execute');
                          }}
                        >
                          <Play className="w-4 h-4" /> Execute
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'view' && viewingCaseId) {
    const tc = testCases.find(c => c.id === viewingCaseId);
    if (!tc) return null;

    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setStep('grid')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">View Details</span>
                <span className="text-xs font-mono text-zinc-500">{tc.testCaseId}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{tc.title}</h1>
            </div>
          </div>
          <Button 
            onClick={() => {
              setExecutingCaseId(tc.id);
              setStep('execute');
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Play className="w-4 h-4" /> Execute Now
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{tc.description || 'No description provided.'}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Preconditions</h3>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{tc.preconditions || 'None'}</p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Test Data</h3>
              <p className="text-sm font-mono text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100 whitespace-pre-wrap">{tc.testData || 'None'}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Requirements</h3>
              <p className="text-sm text-zinc-700">{tc.relatedRequirements || 'None'}</p>
            </div>
          </section>
        </div>

        <section className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Test Script / Steps</h3>
          <div className="space-y-4">
            {tc.steps.map((step, i) => (
              <div key={step.id} className="flex gap-4 p-4 rounded-lg bg-zinc-50/50 border border-zinc-100">
                <span className="text-zinc-400 font-bold text-sm">{i + 1}.</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Action</span>
                    <p className="text-sm text-zinc-900 font-medium">{step.action}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Expected Result</span>
                    <p className="text-sm text-zinc-600 italic">{step.expectedResult}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (step === 'execute' && executingCaseId) {
    const tc = testCases.find(c => c.id === executingCaseId);
    if (!tc) return null;

    return (
      <TestCaseExecution 
        testCase={tc}
        onBack={() => setStep('grid')}
        onSaveResult={(id, status) => {
          const updates: Partial<TestCase> = {
            executor: selectedExecutor?.name,
            executorId: executorId,
          };
          if (testerRole === 'QA tester') updates.qaStatus = status;
          else if (testerRole === 'UAT tester') updates.uatStatus = status;
          else if (testerRole === 'BAT tester') updates.batStatus = status;
          
          onUpdateTestCase(id, updates);
        }}
      />
    );
  }

  return null;
}
