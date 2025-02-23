/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import Home from '../app/page'; // Ensure this path is correct

// Dummy test to ensure Jest picks up tests
test('dummy test', () => {
  expect(true).toBe(true);
});

// Your component test (ensure Home renders something)
test('renders homepage heading', () => {
  render(<Home />);
  const heading = screen.getByRole('heading', { name: /techmetrix/i });
  expect(heading).toBeInTheDocument();
});
