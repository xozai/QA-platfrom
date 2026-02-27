import { useState, useEffect } from 'react';
import { useTestStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TestCaseGrid } from './components/TestCaseGrid';
import { TestCaseView } from './components/TestCaseView';
import { TestCaseExecution } from './components/TestCaseExecution';
import { TestSuiteList } from './components/TestSuiteList';
import { TestSuiteForm } from './components/TestSuiteForm';
import { TestSuiteView } from './components/TestSuiteView';
import { TestRunner } from './components/TestRunner';
import { UserManagement } from './components/UserManagement';
import { ChatBot } from './components/ChatBot';

export default function App() {
  const { 
    testCases, addTestCase, updateTestCase, deleteTestCase, copyTestCase,
    testSuites, addTestSuite, updateTestSuite, deleteTestSuite, toggleTestSuiteVisibility,
    users, addUser, updateUser, deleteUser
  } = useTestStore();

  const confirmDeleteTestCase = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      deleteTestCase(id);
    }
  };

  const confirmDeleteTestSuite = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test suite? All associated test cases will be unlinked.')) {
      deleteTestSuite(id);
    }
  };
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(null);
  const [selectedTestSuiteId, setSelectedTestSuiteId] = useState<string | null>(null);

  // Handle URL parameters for direct suite linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const suiteId = params.get('suiteId');
    if (suiteId && testSuites.some(s => s.id === suiteId)) {
      handleNavigate('view-suite', suiteId);
      // Clean up URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [testSuites.length]);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    
    if (view === 'view' || view === 'edit' || view === 'execute') {
      if (id) setSelectedTestCaseId(id);
    } else if (view === 'view-suite' || view === 'edit-suite') {
      if (id) setSelectedTestSuiteId(id);
    } else {
      // Reset selections when navigating to top-level views
      if (view === 'list' || view === 'dashboard' || view === 'create') {
        setSelectedTestCaseId(null);
      }
      if (view === 'suites' || view === 'dashboard' || view === 'create-suite' || view === 'runner' || view === 'users') {
        setSelectedTestSuiteId(null);
      }
    }
  };

  const selectedTestCase = testCases.find(tc => tc.id === selectedTestCaseId);
  const selectedTestSuite = testSuites.find(ts => ts.id === selectedTestSuiteId);

  return (
    <div className="flex h-screen w-full bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      
      <main className="flex-1 h-full overflow-y-auto">
        {currentView === 'dashboard' && (
          <Dashboard testCases={testCases} testSuites={testSuites} onNavigate={handleNavigate} />
        )}
        
        {/* Test Cases Views */}
        {currentView === 'list' && (
          <TestCaseGrid 
            testCases={testCases} 
            testSuites={testSuites}
            users={users}
            onAdd={addTestCase}
            onUpdate={updateTestCase}
            onDelete={confirmDeleteTestCase}
            onCopy={copyTestCase}
            onView={(id) => handleNavigate('view', id)}
            onExecute={(id) => handleNavigate('execute', id)}
          />
        )}
        
        {currentView === 'create' && (
          <TestCaseGrid 
            testCases={testCases} 
            testSuites={testSuites}
            users={users}
            onAdd={addTestCase}
            onUpdate={updateTestCase}
            onDelete={confirmDeleteTestCase}
            onCopy={copyTestCase}
            onView={(id) => handleNavigate('view', id)}
            onExecute={(id) => handleNavigate('execute', id)}
            initialCreate={true}
          />
        )}
        
        {currentView === 'edit' && selectedTestCase && (
          <TestCaseGrid 
            testCases={testCases} 
            testSuites={testSuites}
            users={users}
            onAdd={addTestCase}
            onUpdate={updateTestCase}
            onDelete={confirmDeleteTestCase}
            onCopy={copyTestCase}
            onView={(id) => handleNavigate('view', id)}
            onExecute={(id) => handleNavigate('execute', id)}
            initialEditId={selectedTestCase.id}
          />
        )}
        
        {currentView === 'view' && selectedTestCase && (
          <TestCaseView 
            testCase={selectedTestCase}
            onBack={() => handleNavigate('list')}
            onEdit={() => handleNavigate('edit', selectedTestCase.id)}
            onExecute={() => handleNavigate('execute', selectedTestCase.id)}
          />
        )}
        
        {currentView === 'execute' && selectedTestCase && (
          <TestCaseExecution 
            testCase={selectedTestCase}
            onBack={() => handleNavigate('list')}
            onSaveResult={(id, status) => {
              // Default to QA status for individual execution
              updateTestCase(id, { qaStatus: status });
            }}
          />
        )}

        {/* Test Suites Views */}
        {currentView === 'suites' && (
          <TestSuiteList 
            testSuites={testSuites}
            testCases={testCases}
            onView={(id) => handleNavigate('view-suite', id)}
            onEdit={(id) => handleNavigate('edit-suite', id)}
            onDelete={confirmDeleteTestSuite}
            onToggleVisibility={toggleTestSuiteVisibility}
          />
        )}

        {currentView === 'create-suite' && (
          <TestSuiteForm 
            users={users}
            onSave={(data) => {
              addTestSuite(data);
              handleNavigate('suites');
            }}
            onCancel={() => handleNavigate('suites')}
          />
        )}

        {currentView === 'edit-suite' && selectedTestSuite && (
          <TestSuiteForm 
            initialData={selectedTestSuite}
            users={users}
            onSave={(data) => {
              updateTestSuite(selectedTestSuite.id, data);
              handleNavigate('suites');
            }}
            onCancel={() => handleNavigate('suites')}
          />
        )}

        {currentView === 'view-suite' && selectedTestSuite && (
          <TestSuiteView 
            testSuite={selectedTestSuite}
            testCases={testCases}
            users={users}
            onBack={() => handleNavigate('suites')}
            onEdit={() => handleNavigate('edit-suite', selectedTestSuite.id)}
            onCopyTestCase={copyTestCase}
            onViewTestCase={(id) => handleNavigate('view', id)}
            onEditTestCase={(id) => handleNavigate('edit', id)}
            onExecuteTestCase={(id) => handleNavigate('execute', id)}
            onDeleteTestCase={confirmDeleteTestCase}
          />
        )}

        {/* Test Runner View */}
        {currentView === 'runner' && (
          <TestRunner 
            testSuites={testSuites}
            testCases={testCases}
            users={users}
            onUpdateTestCase={updateTestCase}
          />
        )}

        {/* User Management View */}
        {currentView === 'users' && (
          <UserManagement 
            users={users}
            onAdd={addUser}
            onUpdate={updateUser}
            onDelete={deleteUser}
          />
        )}
      </main>

      <ChatBot 
        testSuites={testSuites}
        onAddTestSuite={addTestSuite}
        onAddTestCase={addTestCase}
      />
    </div>
  );
}
