import React, { useState, useEffect } from 'react';
import { TestCase, TestSuite, TestPriority, TestStatus, TestStep, User } from '@/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Play, Eye, Trash2, Plus, Save, X, Edit2, ListTodo, Copy, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, FilterX } from 'lucide-react';
import { Badge } from './ui/Badge';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/Textarea';

interface TestCaseGridProps {
  testCases: TestCase[];
  testSuites: TestSuite[];
  users: User[];
  onAdd: (tc: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, tc: Partial<TestCase>) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onView: (id: string) => void;
  onExecute: (id: string) => void;
  initialCreate?: boolean;
  initialEditId?: string | null;
  showHidden?: boolean;
}

export function TestCaseGrid({ 
  testCases, 
  testSuites, 
  users,
  onAdd, 
  onUpdate, 
  onDelete, 
  onCopy,
  onView, 
  onExecute, 
  initialCreate,
  initialEditId,
  showHidden = false
}: TestCaseGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TestCase>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: '', direction: null });
  
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<TestStep[]>([]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: '', direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleColumnFilter = (key: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setColumnFilters({});
    setFilterText('');
  };

  const filteredCases = testCases.filter(tc => {
    const suite = testSuites.find(s => s.id === tc.testSuiteId);
    
    // Respect hidden suites - only show if suite is not hidden, OR if showHidden is true
    if (!showHidden && suite?.isHidden) return false;

    const owner = users.find(u => u.id === suite?.ownerId);
    
    // Global filter
    const searchStr = `${tc.testCaseId} ${tc.title} ${tc.description} ${suite?.jiraNumber || ''} ${owner?.name || ''} ${tc.steps.map(s => s.action).join(' ')}`.toLowerCase();
    if (!searchStr.includes(filterText.toLowerCase())) return false;

    // Column filters
    for (const [key, value] of Object.entries(columnFilters)) {
      if (!value) continue;
      const val = (value as string).toLowerCase();
      
      switch (key) {
        case 'testCaseId': if (!tc.testCaseId.toLowerCase().includes(val)) return false; break;
        case 'suite': if (!(suite?.name || '').toLowerCase().includes(val)) return false; break;
        case 'jira': if (!(suite?.jiraNumber || '').toLowerCase().includes(val)) return false; break;
        case 'owner': if (!(owner?.name || '').toLowerCase().includes(val)) return false; break;
        case 'title': if (!tc.title.toLowerCase().includes(val)) return false; break;
        case 'priority': if (!tc.priority.toLowerCase().includes(val)) return false; break;
        case 'qaStatus': if (!tc.qaStatus.toLowerCase().includes(val)) return false; break;
        case 'uatStatus': if (!tc.uatStatus.toLowerCase().includes(val)) return false; break;
        case 'batStatus': if (!tc.batStatus.toLowerCase().includes(val)) return false; break;
        case 'description': if (!tc.description.toLowerCase().includes(val)) return false; break;
        case 'preconditions': if (!tc.preconditions.toLowerCase().includes(val)) return false; break;
        case 'testData': if (!tc.testData.toLowerCase().includes(val)) return false; break;
        case 'relatedRequirements': if (!tc.relatedRequirements.toLowerCase().includes(val)) return false; break;
      }
    }
    
    return true;
  }).sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;
    
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    const key = sortConfig.key;
    
    let valA: any = '';
    let valB: any = '';

    const suiteA = testSuites.find(s => s.id === a.testSuiteId);
    const suiteB = testSuites.find(s => s.id === b.testSuiteId);
    const ownerA = users.find(u => u.id === suiteA?.ownerId);
    const ownerB = users.find(u => u.id === suiteB?.ownerId);

    switch (key) {
      case 'suite': valA = suiteA?.name || ''; valB = suiteB?.name || ''; break;
      case 'jira': valA = suiteA?.jiraNumber || ''; valB = suiteB?.jiraNumber || ''; break;
      case 'owner': valA = ownerA?.name || ''; valB = ownerB?.name || ''; break;
      default: valA = (a as any)[key] || ''; valB = (b as any)[key] || '';
    }

    if (valA < valB) return -1 * direction;
    if (valA > valB) return 1 * direction;
    return 0;
  });

  useEffect(() => {
    if (initialCreate) {
      handleCreate();
    } else if (initialEditId) {
      const tc = testCases.find(t => t.id === initialEditId);
      if (tc) handleEdit(tc);
    }
  }, [initialCreate, initialEditId]);

  const handleEdit = (tc: TestCase) => {
    setEditingId(tc.id);
    setEditData(tc);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId('new');
    setEditData({
      testCaseId: '',
      title: '',
      testSuiteId: '',
      priority: 'Medium',
      qaStatus: 'Untested',
      uatStatus: 'Untested',
      batStatus: 'Untested',
      description: '',
      preconditions: '',
      testData: '',
      relatedRequirements: '',
      steps: [{ id: crypto.randomUUID(), action: '', expectedResult: '' }]
    });
  };

  const handleSave = () => {
    if (isCreating) {
      onAdd(editData as Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (editingId) {
      onUpdate(editingId, editData);
    }
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
  };

  const handleChange = (field: keyof TestCase, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const openStepsModal = (steps: TestStep[]) => {
    setCurrentSteps(steps || []);
    setStepsModalOpen(true);
  };

  const saveSteps = () => {
    handleChange('steps', currentSteps);
    setStepsModalOpen(false);
  };

  const getStatusBadge = (status: string, label?: string) => {
    const badge = (() => {
      switch (status) {
        case 'Pass': return <Badge variant="success">Pass</Badge>;
        case 'Fail': return <Badge variant="destructive">Fail</Badge>;
        case 'Blocked': return <Badge variant="warning">Blocked</Badge>;
        case 'Skipped': return <Badge variant="secondary">Skipped</Badge>;
        default: return <Badge variant="outline">Untested</Badge>;
      }
    })();

    if (label) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-400 uppercase font-bold leading-none">{label}</span>
          {badge}
        </div>
      );
    }
    return badge;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return <Badge variant="destructive">High</Badge>;
      case 'Medium': return <Badge variant="warning">Medium</Badge>;
      case 'Low': return <Badge variant="info">Low</Badge>;
      default: return null;
    }
  };

  const renderEditableRow = (isNew: boolean, data: Partial<TestCase>) => (
    <tr className={cn("bg-indigo-50/30", isNew ? "" : "bg-blue-50/30")}>
      <td className="p-2 min-w-[120px]">
        <Input 
          value={data.testCaseId || ''} 
          onChange={e => handleChange('testCaseId', e.target.value)}
          className="h-8 text-xs"
          placeholder="ID"
        />
      </td>
      <td className="p-2 min-w-[150px]">
        <select 
          value={data.testSuiteId || ''} 
          onChange={e => handleChange('testSuiteId', e.target.value)}
          className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
        >
          <option value="">None</option>
          {testSuites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </td>
      <td className="p-2 min-w-[100px] text-zinc-400 italic text-xs">Inherited</td>
      <td className="p-2 min-w-[100px] text-zinc-400 italic text-xs">Inherited</td>
      <td className="p-2 min-w-[200px]">
        <Input 
          value={data.title || ''} 
          onChange={e => handleChange('title', e.target.value)}
          className="h-8 text-xs"
          placeholder="Title"
        />
      </td>
      <td className="p-2 min-w-[100px]">
        <select 
          value={data.priority || 'Medium'} 
          onChange={e => handleChange('priority', e.target.value)}
          className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </td>
      <td className="p-2 min-w-[280px]">
        <div className="flex gap-2">
          <select 
            value={data.qaStatus || 'Untested'} 
            onChange={e => handleChange('qaStatus', e.target.value)}
            className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
          >
            <option value="Untested">QA: Untested</option>
            <option value="Pass">QA: Pass</option>
            <option value="Fail">QA: Fail</option>
            <option value="Blocked">QA: Blocked</option>
            <option value="Skipped">QA: Skipped</option>
          </select>
          <select 
            value={data.uatStatus || 'Untested'} 
            onChange={e => handleChange('uatStatus', e.target.value)}
            className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
          >
            <option value="Untested">UAT: Untested</option>
            <option value="Pass">UAT: Pass</option>
            <option value="Fail">UAT: Fail</option>
            <option value="Blocked">UAT: Blocked</option>
            <option value="Skipped">UAT: Skipped</option>
          </select>
          <select 
            value={data.batStatus || 'Untested'} 
            onChange={e => handleChange('batStatus', e.target.value)}
            className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
          >
            <option value="Untested">BAT: Untested</option>
            <option value="Pass">BAT: Pass</option>
            <option value="Fail">BAT: Fail</option>
            <option value="Blocked">BAT: Blocked</option>
            <option value="Skipped">BAT: Skipped</option>
          </select>
        </div>
      </td>
      <td className="p-2 min-w-[150px]">
        <Input 
          value={data.description || ''} 
          onChange={e => handleChange('description', e.target.value)}
          className="h-8 text-xs"
          placeholder="Description"
        />
      </td>
      <td className="p-2 min-w-[150px]">
        <Input 
          value={data.preconditions || ''} 
          onChange={e => handleChange('preconditions', e.target.value)}
          className="h-8 text-xs"
          placeholder="Preconditions"
        />
      </td>
      <td className="p-2 min-w-[150px]">
        <Input 
          value={data.testData || ''} 
          onChange={e => handleChange('testData', e.target.value)}
          className="h-8 text-xs"
          placeholder="Test Data"
        />
      </td>
      <td className="p-2 min-w-[120px]">
        <Input 
          value={data.relatedRequirements || ''} 
          onChange={e => handleChange('relatedRequirements', e.target.value)}
          className="h-8 text-xs"
          placeholder="Reqs"
        />
      </td>
      <td className="p-2 min-w-[100px]">
        <Button variant="outline" size="sm" className="h-8 text-xs w-full" onClick={() => openStepsModal(data.steps || [])}>
          {data.steps?.length || 0} Steps
        </Button>
      </td>
      <td className="p-2 min-w-[120px] sticky right-0 bg-indigo-50/90 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] text-right space-x-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={handleSave}>
          <Save className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" onClick={handleCancel}>
          <X className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );

  return (
    <div className="p-8 w-full h-full flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between shrink-0 gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Test Cases Grid</h1>
          <p className="text-zinc-500 mt-2">Create and manage test cases with multi-status tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Filter by ID, title, JIRA, owner..."
              className="pl-9 w-64 h-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={cn(showFilters && "bg-zinc-100 border-zinc-300")}>
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={clearFilters} title="Clear All Filters">
            <FilterX className="w-4 h-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2" disabled={isCreating || editingId !== null}>
            <Plus className="w-4 h-4" /> Add Row
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex-1 overflow-hidden flex flex-col relative">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
              <tr>
                {[
                  { label: 'ID', key: 'testCaseId' },
                  { label: 'Suite', key: 'suite' },
                  { label: 'JIRA', key: 'jira' },
                  { label: 'Owner', key: 'owner' },
                  { label: 'Title', key: 'title' },
                  { label: 'Priority', key: 'priority' },
                  { label: 'Status', key: 'qaStatus' },
                  { label: 'Description', key: 'description' },
                  { label: 'Preconditions', key: 'preconditions' },
                  { label: 'Test Data', key: 'testData' },
                  { label: 'Reqs', key: 'relatedRequirements' },
                  { label: 'Steps', key: 'steps' }
                ].map(col => (
                  <th key={col.key} className="px-4 py-3 font-medium">
                    <button 
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-zinc-900 transition-colors uppercase"
                    >
                      {col.label}
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 font-medium sticky right-0 bg-zinc-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] text-right">Actions</th>
              </tr>
              {showFilters && (
                <tr className="bg-zinc-100/50 border-b border-zinc-200">
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter ID..." value={columnFilters.testCaseId || ''} onChange={e => handleColumnFilter('testCaseId', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter Suite..." value={columnFilters.suite || ''} onChange={e => handleColumnFilter('suite', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter JIRA..." value={columnFilters.jira || ''} onChange={e => handleColumnFilter('jira', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter Owner..." value={columnFilters.owner || ''} onChange={e => handleColumnFilter('owner', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter Title..." value={columnFilters.title || ''} onChange={e => handleColumnFilter('title', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter Priority..." value={columnFilters.priority || ''} onChange={e => handleColumnFilter('priority', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter Status..." value={columnFilters.qaStatus || ''} onChange={e => handleColumnFilter('qaStatus', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter Desc..." value={columnFilters.description || ''} onChange={e => handleColumnFilter('description', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter Precond..." value={columnFilters.preconditions || ''} onChange={e => handleColumnFilter('preconditions', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter Data..." value={columnFilters.testData || ''} onChange={e => handleColumnFilter('testData', e.target.value)} /></td>
                  <td className="p-2"><Input className="h-7 text-[10px] px-2" placeholder="Filter Reqs..." value={columnFilters.relatedRequirements || ''} onChange={e => handleColumnFilter('relatedRequirements', e.target.value)} /></td>
                  <td className="p-2"></td>
                  <td className="p-2 sticky right-0 bg-zinc-100/50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]"></td>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isCreating && renderEditableRow(true, editData)}
              
              {filteredCases.map(tc => {
                if (editingId === tc.id) {
                  return renderEditableRow(false, editData);
                }
                
                const suite = testSuites.find(s => s.id === tc.testSuiteId);
                const owner = users.find(u => u.id === suite?.ownerId);
                
                return (
                  <tr key={tc.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-4 py-3 font-mono text-zinc-600">{tc.testCaseId}</td>
                    <td className="px-4 py-3 text-zinc-600 truncate max-w-[150px]">{suite?.name || '-'}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{suite?.jiraNumber || '-'}</td>
                    <td className="px-4 py-3 text-zinc-500">{owner?.name || '-'}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900 truncate max-w-[200px]">{tc.title}</td>
                    <td className="px-4 py-3">{getPriorityBadge(tc.priority)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {getStatusBadge(tc.qaStatus, 'QA')}
                        {getStatusBadge(tc.uatStatus, 'UAT')}
                        {getStatusBadge(tc.batStatus, 'BAT')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 truncate max-w-[150px]">{tc.description || '-'}</td>
                    <td className="px-4 py-3 text-zinc-500 truncate max-w-[150px]">{tc.preconditions || '-'}</td>
                    <td className="px-4 py-3 text-zinc-500 truncate max-w-[150px]">{tc.testData || '-'}</td>
                    <td className="px-4 py-3 text-zinc-500 truncate max-w-[120px]">{tc.relatedRequirements || '-'}</td>
                    <td className="px-4 py-3 text-zinc-500">{tc.steps.length} Steps</td>
                    <td className="px-4 py-2 text-right space-x-1 sticky right-0 bg-white group-hover:bg-zinc-50/50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] transition-colors">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onExecute(tc.id)} title="Execute">
                        <Play className="w-4 h-4 text-emerald-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(tc.id)} title="View">
                        <Eye className="w-4 h-4 text-zinc-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(tc)} title="Edit">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(tc.id)} title="Copy">
                        <Copy className="w-4 h-4 text-indigo-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(tc.id)} title="Delete">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {testCases.length === 0 && !isCreating && (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-zinc-500">
                    No test cases found. Click "Add Row" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Steps Modal */}
      {stepsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-zinc-900">Edit Test Steps</h2>
              <Button variant="ghost" size="icon" onClick={() => setStepsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {currentSteps.map((step, index) => (
                <div key={step.id} className="flex gap-4 items-start bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-semibold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</label>
                      <Textarea 
                        value={step.action} 
                        onChange={(e) => setCurrentSteps(prev => prev.map(s => s.id === step.id ? { ...s, action: e.target.value } : s))}
                        placeholder="e.g., Navigate to login page"
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Expected Result</label>
                      <Textarea 
                        value={step.expectedResult} 
                        onChange={(e) => setCurrentSteps(prev => prev.map(s => s.id === step.id ? { ...s, expectedResult: e.target.value } : s))}
                        placeholder="e.g., Login page loads with fields visible"
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCurrentSteps(prev => prev.filter(s => s.id !== step.id))}
                    className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentSteps(prev => [...prev, { id: crypto.randomUUID(), action: '', expectedResult: '' }])} 
                className="w-full gap-2 border-dashed"
              >
                <Plus className="w-4 h-4" /> Add Step
              </Button>
            </div>
            
            <div className="p-6 border-t border-zinc-100 flex justify-end gap-4 shrink-0">
              <Button variant="outline" onClick={() => setStepsModalOpen(false)}>Cancel</Button>
              <Button onClick={saveSteps}>Save Steps</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
