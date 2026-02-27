import { LayoutDashboard, ListTodo, PlusCircle, Settings, FolderOpen, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'suites', label: 'Test Suites', icon: FolderOpen },
    { id: 'create-suite', label: 'New Test Suite', icon: FolderPlus },
    { id: 'list', label: 'Test Cases', icon: ListTodo },
    { id: 'create', label: 'New Test Case', icon: PlusCircle },
  ];

  return (
    <div className="w-64 bg-zinc-950 text-zinc-300 flex flex-col h-full border-r border-zinc-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <ListTodo className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">QA Manager</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || 
            (currentView === 'view' && item.id === 'list') || 
            (currentView === 'edit' && item.id === 'list') || 
            (currentView === 'execute' && item.id === 'list') ||
            (currentView === 'view-suite' && item.id === 'suites') ||
            (currentView === 'edit-suite' && item.id === 'suites');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-zinc-800 text-white" 
                  : "hover:bg-zinc-800/50 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-zinc-800">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-800/50 hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
