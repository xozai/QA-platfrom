import { useState } from 'react';
import { useTestStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TestCaseGrid } from './components/TestCaseGrid';
import { TestCaseView } from './components/TestCaseView';
import { TestCaseExecution } from './components/TestCaseExecution';
import { TestSuiteList } from './components/TestSuiteList';
import { TestSuiteForm } from './components/TestSuiteForm';
import { TestSuiteView } from './components/TestSuiteView';

export default function App() {
  const { 
    testCases, addTestCase, updateTestCase, deleteTestCase,
    testSuites, addTestSuite, updateTestSuite, deleteTestSuite
  } = useTestStore();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(null);
  const [selectedTestSuiteId, setSelectedTestSuiteId] = useState<string | null>(null);

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
      if (view === 'suites' || view === 'dashboard' || view === 'create-suite') {
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
          <Dashboard testCases={testCases} onNavigate={handleNavigate} />
        )}
        
        {/* Test Cases Views */}
        {currentView === 'list' && (
          <TestCaseGrid 
            testCases={testCases} 
            testSuites={testSuites}
            onAdd={addTestCase}
            onUpdate={updateTestCase}
            onDelete={deleteTestCase}
            onView={(id) => handleNavigate('view', id)}
            onExecute={(id) => handleNavigate('execute', id)}
          />
        )}
        
        {currentView === 'create' && (
          <TestCaseGrid 
            testCases={testCases} 
            testSuites={testSuites}
            onAdd={addTestCase}
            onUpdate={updateTestCase}
            onDelete={deleteTestCase}
            onView={(id) => handleNavigate('view', id)}
            onExecute={(id) => handleNavigate('execute', id)}
            initialCreate={true}
          />
        )}
        
        {currentView === 'edit' && selectedTestCase && (
          <TestCaseGrid 
            testCases={testCases} 
            testSuites={testSuites}
            onAdd={addTestCase}
            onUpdate={updateTestCase}
            onDelete={deleteTestCase}
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
              updateTestCase(id, { status });
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
            onDelete={deleteTestSuite}
          />
        )}

        {currentView === 'create-suite' && (
          <TestSuiteForm 
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
            onBack={() => handleNavigate('suites')}
            onEdit={() => handleNavigate('edit-suite', selectedTestSuite.id)}
            onViewTestCase={(id) => handleNavigate('view', id)}
            onEditTestCase={(id) => handleNavigate('edit', id)}
            onExecuteTestCase={(id) => handleNavigate('execute', id)}
            onDeleteTestCase={deleteTestCase}
          />
        )}
      </main>
    </div>
  );
}
