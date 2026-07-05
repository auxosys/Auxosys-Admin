import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';

test('renders the login page when unauthenticated', () => {
  render(
    <MemoryRouter>
      <AdminLogin />
    </MemoryRouter>
  );
  expect(screen.getByText(/Admin Sign In/i)).toBeInTheDocument();
  expect(screen.getByText(/Enter your admin credentials to continue/i)).toBeInTheDocument();
});
