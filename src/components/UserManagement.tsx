import React, { useState } from 'react';
import { User, UserRole } from '@/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Plus, Edit2, Trash2, X, Save, Mail, User as UserIcon, Shield } from 'lucide-react';
import { Badge } from './ui/Badge';
import { cn } from '@/lib/utils';

interface UserManagementProps {
  users: User[];
  onAdd: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, user: Partial<User>) => void;
  onDelete: (id: string) => void;
}

const ROLE_OPTIONS: UserRole[] = ['BSA', 'Developer', 'QA', 'UAT', 'Business User', 'Other'];

export function UserManagement({ users, onAdd, onUpdate, onDelete }: UserManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    roles: []
  });

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData(user);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ name: '', email: '', roles: [] });
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) return;

    if (isAdding) {
      onAdd(formData as Omit<User, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (editingId) {
      onUpdate(editingId, formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', email: '', roles: [] });
  };

  const toggleRole = (role: UserRole) => {
    setFormData(prev => {
      const roles = prev.roles || [];
      if (roles.includes(role)) {
        return { ...prev, roles: roles.filter(r => r !== role) };
      } else {
        return { ...prev, roles: [...roles, role] };
      }
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">User Management</h1>
          <p className="text-zinc-500 mt-2">Create and manage team members and their roles.</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add User
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900">
              {isAdding ? 'Add New User' : 'Edit User'}
            </h2>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. john@example.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Roles (Multi-select)
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      formData.roles?.includes(role)
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.email}>
              <Save className="w-4 h-4 mr-2" /> {isAdding ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Roles</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900">{user.name}</div>
                      <div className="text-zinc-500 text-xs">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                      <span key={role}>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {role}
                        </Badge>
                      </span>
                    ))}
                    {user.roles.length === 0 && <span className="text-zinc-400 italic">No roles</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(user)}>
                    <Edit2 className="w-4 h-4 text-zinc-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(user.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic">
                  No users found. Add your team members to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
