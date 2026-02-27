import { TestCase } from '@/types';
import { CheckCircle2, XCircle, AlertCircle, Clock, ListTodo } from 'lucide-react';

interface DashboardProps {
  testCases: TestCase[];
  onNavigate: (view: string) => void;
}

export function Dashboard({ testCases, onNavigate }: DashboardProps) {
  const total = testCases.length;
  const passed = testCases.filter(tc => tc.status === 'Pass').length;
  const failed = testCases.filter(tc => tc.status === 'Fail').length;
  const blocked = testCases.filter(tc => tc.status === 'Blocked').length;
  const untested = testCases.filter(tc => tc.status === 'Untested').length;
  const skipped = testCases.filter(tc => tc.status === 'Skipped').length;

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const stats = [
    { label: 'Total Tests', value: total, icon: ListTodo, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Passed', value: passed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Failed', value: failed, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Blocked', value: blocked, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Untested', value: untested, icon: Clock, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 mt-2">Overview of your test execution status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-zinc-500">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-zinc-900">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Recent Test Cases</h2>
          <div className="space-y-4">
            {testCases.slice(0, 5).map(tc => (
              <div key={tc.id} className="flex items-center justify-between p-4 rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-zinc-500">{tc.testCaseId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tc.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' :
                      tc.status === 'Fail' ? 'bg-red-100 text-red-700' :
                      tc.status === 'Blocked' ? 'bg-amber-100 text-amber-700' :
                      tc.status === 'Skipped' ? 'bg-zinc-200 text-zinc-700' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {tc.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-zinc-900">{tc.title}</h3>
                </div>
                <button 
                  onClick={() => {
                    // We'll need a way to navigate to view with ID.
                    // For now, we'll just navigate to list.
                    onNavigate('list');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View
                </button>
              </div>
            ))}
            {testCases.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No test cases yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Pass Rate</h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-zinc-100 stroke-current"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <circle
                  className="text-emerald-500 stroke-current"
                  strokeWidth="10"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray={`${passRate * 2.51327} 251.327`}
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-zinc-900">{passRate}%</span>
                <span className="text-xs text-zinc-500">Passed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
