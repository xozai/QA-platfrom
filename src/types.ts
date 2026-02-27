export type TestStatus = 'Untested' | 'Pass' | 'Fail' | 'Blocked' | 'Skipped';
export type TestPriority = 'High' | 'Medium' | 'Low';

export interface TestStep {
  id: string;
  action: string;
  expectedResult: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  testCaseId: string;
  title: string;
  description: string;
  preconditions: string;
  testData: string;
  steps: TestStep[];
  status: TestStatus;
  priority: TestPriority;
  relatedRequirements: string;
  testSuiteId?: string;
  createdAt: string;
  updatedAt: string;
}
