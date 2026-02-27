import { useState, useEffect } from 'react';
import { TestCase, TestSuite } from './types';

const STORAGE_KEY_CASES = 'qa_test_cases';
const STORAGE_KEY_SUITES = 'qa_test_suites';

const initialData: TestCase[] = [
  {
    id: '1',
    testCaseId: 'TC-CHECKOUT-CC-01',
    title: 'User completes purchase with valid credit card',
    description: 'Verify that registered users can successfully complete purchases using valid credit card payment, receive order confirmation, and see order in purchase history.',
    preconditions: 'User account exists with username "test@example.com"\nShopping cart contains at least one product\nPayment gateway configured for test transactions\nTest environment accessible and running',
    testData: 'Username: test@example.com\nPassword: TestPass123\nCredit Card: 4111 1111 1111 1111\nExpiry: 12/25\nCVV: 123',
    steps: [
      { id: 's1', action: 'Navigate to login page', expectedResult: 'Login page loads with username and password fields visible' },
      { id: 's2', action: 'Enter username "test@example.com" and password "TestPass123"', expectedResult: 'Credentials entered' },
      { id: 's3', action: 'Click "Login" button', expectedResult: 'Dashboard displays welcome message' },
      { id: 's4', action: 'Navigate to cart and click "Checkout"', expectedResult: 'Checkout page loads' },
      { id: 's5', action: 'Enter valid credit card details and submit', expectedResult: 'Order confirmation page displays with order number' }
    ],
    status: 'Untested',
    priority: 'High',
    relatedRequirements: 'US-123, AC-456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function useTestStore() {
  const [testCases, setTestCases] = useState<TestCase[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_CASES);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored test cases', e);
      }
    }
    return initialData;
  });

  const [testSuites, setTestSuites] = useState<TestSuite[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SUITES);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored test suites', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(testCases));
  }, [testCases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUITES, JSON.stringify(testSuites));
  }, [testSuites]);

  const addTestCase = (testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTestCase: TestCase = {
      ...testCase,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTestCases(prev => [newTestCase, ...prev]);
  };

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    setTestCases(prev => prev.map(tc => 
      tc.id === id ? { ...tc, ...updates, updatedAt: new Date().toISOString() } : tc
    ));
  };

  const deleteTestCase = (id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  };

  const addTestSuite = (testSuite: Omit<TestSuite, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTestSuite: TestSuite = {
      ...testSuite,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTestSuites(prev => [newTestSuite, ...prev]);
  };

  const updateTestSuite = (id: string, updates: Partial<TestSuite>) => {
    setTestSuites(prev => prev.map(ts => 
      ts.id === id ? { ...ts, ...updates, updatedAt: new Date().toISOString() } : ts
    ));
  };

  const deleteTestSuite = (id: string) => {
    setTestSuites(prev => prev.filter(ts => ts.id !== id));
    // Also remove testSuiteId from associated test cases
    setTestCases(prev => prev.map(tc => 
      tc.testSuiteId === id ? { ...tc, testSuiteId: undefined, updatedAt: new Date().toISOString() } : tc
    ));
  };

  return {
    testCases,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    testSuites,
    addTestSuite,
    updateTestSuite,
    deleteTestSuite
  };
}
