import { Project } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    projectName: 'ACME Corp Website',
    clientName: 'John Doe',
    clientEmail: 'john@acme.com',
    projectPrice: 5000,
    hourlyRate: 100,
    currency: 'USD',
    timeline: '6 weeks',
    startDate: '2023-11-01',
    endDate: '2023-12-15',
    status: 'Active',
    deliverables: [
      { id: 'd1', description: '5-page website (Home, About, Services, Contact, Portfolio)', category: 'Development', status: 'In Progress', type: 'IN_SCOPE' },
      { id: 'd2', description: 'Mobile responsive design', category: 'Design', status: 'Completed', type: 'IN_SCOPE' },
      { id: 'd3', description: 'E-commerce functionality', category: 'Development', status: 'To Do', type: 'OUT_SCOPE' },
    ],
    requests: [
      {
        id: 'r1',
        projectId: '1',
        requestText: 'Add blog section with comments',
        dateRequested: '2023-11-10',
        category: 'New Feature',
        scopeStatus: 'OUT_SCOPE',
        estimatedHours: 8,
        estimatedCost: 800,
        timelineImpact: '+3 days',
        status: 'Pending'
      },
      {
        id: 'r2',
        projectId: '1',
        requestText: 'Change button color to red',
        dateRequested: '2023-11-12',
        category: 'Design Change',
        scopeStatus: 'IN_SCOPE',
        estimatedHours: 0,
        estimatedCost: 0,
        timelineImpact: 'None',
        note: 'Covered by revision rounds',
        status: 'Approved'
      },
       {
        id: 'r3',
        projectId: '1',
        requestText: 'Integrate Salesforce CRM',
        dateRequested: '2023-11-15',
        category: 'Integration',
        scopeStatus: 'OUT_SCOPE',
        estimatedHours: 15,
        estimatedCost: 1500,
        timelineImpact: '+1 week',
        status: 'Pending'
      }
    ]
  }
];

export const CATEGORIES = ['Design', 'Development', 'Content', 'Marketing', 'Other'];
export const REQUEST_CATEGORIES = ['Design Change', 'New Feature', 'Integration', 'Content', 'Revision', 'Timeline', 'Other'];
