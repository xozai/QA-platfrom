import React, { useState, useEffect } from 'react';
import { TestSuite } from '@/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { ArrowLeft } from 'lucide-react';

interface TestSuiteFormProps {
  initialData?: TestSuite;
  onSave: (data: Omit<TestSuite, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function TestSuiteForm({ initialData, onSave, onCancel }: TestSuiteFormProps) {
  const [formData, setFormData] = useState<Omit<TestSuite, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {initialData ? 'Edit Test Suite' : 'New Test Suite'}
          </h1>
          <p className="text-zinc-500 mt-1">Group related test cases together.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">Suite Name *</label>
          <Input 
            required
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g., Authentication Module" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">Description</label>
          <Textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Brief explanation of what this suite covers..." 
            className="min-h-[120px]"
          />
        </div>

        <div className="pt-6 border-t border-zinc-100 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Test Suite</Button>
        </div>
      </form>
    </div>
  );
}
