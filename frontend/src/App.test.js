App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios to prevent API calls during testing
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} }))
}));

test('renders HiringSight application', () => {
  render(<App />);
  // Look for the loading spinner initially
  const loadingElement = screen.getByText(/Loading HiringSight/i);
  expect(loadingElement).toBeInTheDocument();
});

test('renders navigation tabs', async () => {
  render(<App />);
  
  // Wait for the component to load and check for navigation
  await screen.findByText(/Dashboard/i);
  
  const dashboardTab = screen.getByText(/Dashboard/i);
  const candidatesTab = screen.getByText(/Candidates/i);
  const teamTab = screen.getByText(/Team Builder/i);
  
  expect(dashboardTab).toBeInTheDocument();
  expect(candidatesTab).toBeInTheDocument();
  expect(teamTab).toBeInTheDocument();
});