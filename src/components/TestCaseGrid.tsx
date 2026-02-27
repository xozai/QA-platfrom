import React, { useState, useEffect } from 'react';
import { TestCase, TestSuite, TestPriority, TestStatus, TestStep } from '@/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Play, Eye, Trash2, Plus, Save, X, Edit2, ListTodo } from 'lucide-react';
import { Badge } from './ui/Badge';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/Textarea';

interface TestCaseGridProps {
  testCases: TestCase[];
  testSuites: TestSuite[];
  onAdd: (tc: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, tc: Partial<TestCase>) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onExecute: (id: string) => void;
  initialCreate?: boolean;
  initialEditId?: string | null;
}

export function TestCaseGrid({ 
  testCases, 
  testSuites, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onView, 
  onExecute, 
  initialCreate,
  initialEditId 
}: TestCaseGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TestCase>>({});
  const [isCreating, setIsCreating] = useState(false);
  
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<TestStep[]>([]);

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
      status: 'Untested',
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pass': return <Badge variant="success">Pass</Badge>;
      case 'Fail': return <Badge variant="destructive">Fail</Badge>;
      case 'Blocked': return <Badge variant="warning">Blocked</Badge>;
      case 'Skipped': return <Badge variant="secondary">Skipped</Badge>;
      default: return <Badge variant="outline">Untested</Badge>;
    }
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
      <td className="p-2 min-w-[100px]">
        <select 
          value={data.status || 'Untested'} 
          onChange={e => handleChange('status', e.target.value)}
          className="flex h-8 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
        >
          <option value="Untested">Untested</option>
          <option value="Pass">Pass</option>
          <option value="Fail">Fail</option>
          <option value="Blocked">Blocked</option>
          <option value="Skipped">Skipped</option>
        </select>
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
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Test Cases Grid</h1>
          <p className="text-zinc-500 mt-2">Create and manage test cases in a spreadsheet-like interface.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2" disabled={isCreating || editingId !== null}>
          <Plus className="w-4 h-4" /> Add Row
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex-1 overflow-hidden flex flex-col relative">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Suite</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Preconditions</th>
                <th className="px-4 py-3 font-medium">Test Data</th>
                <th className="px-4 py-3 font-medium">Reqs</th>
                <th className="px-4 py-3 font-medium">Steps</th>
                <th className="px-4 py-3 font-medium sticky right-0 bg-zinc-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isCreating && renderEditableRow(true, editData)}
              
              {testCases.map(tc => {
                if (editingId === tc.id) {
                  return renderEditableRow(false, editData);
                }
                
                const suite = testSuites.find(s => s.id === tc.testSuiteId);
                
                return (
                  <tr key={tc.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-4 py-3 font-mono text-zinc-600">{tc.testCaseId}</td>
                    <td className="px-4 py-3 text-zinc-600 truncate max-w-[150px]">{suite?.name || '-'}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900 truncate max-w-[200px]">{tc.title}</td>
                    <td className="px-4 py-3">{getPriorityBadge(tc.priority)}</td>
                    <td className="px-4 py-3">{getStatusBadge(tc.status)}</td>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(tc.id)} title="Delete">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {testCases.length === 0 && !isCreating && (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-zinc-500">
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
