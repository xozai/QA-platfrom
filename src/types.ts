export type TestStatus = 'Untested' | 'Pass' | 'Fail' | 'Blocked' | 'Skipped';
export type TestPriority = 'High' | 'Medium' | 'Low';

export type UserRole = 'BSA' | 'Developer' | 'QA' | 'UAT' | 'Business User' | 'Other';
export type TesterRole = 'QA tester' | 'UAT tester' | 'BAT tester';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface TestStep {
  id: string;
  action: string;
  expectedResult: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  ownerId?: string;
  jiraNumber?: string;
  isHidden?: boolean;
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
  qaStatus: TestStatus;
  uatStatus: TestStatus;
  batStatus: TestStatus;
  priority: TestPriority;
  relatedRequirements: string;
  testSuiteId?: string;
  executor?: string;
  executorId?: string;
  createdAt: string;
  updatedAt: string;
}
