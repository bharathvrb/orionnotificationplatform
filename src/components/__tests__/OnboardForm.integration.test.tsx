import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnboardForm } from '../OnboardForm';
import * as api from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockedOnboardOnp = api.onboardOnp as jest.MockedFunction<typeof api.onboardOnp>;

describe('OnboardForm Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      tasks: [
        {
          task: 'mongoDBAndRedis',
          status: 'Success' as const,
          message: 'Successfully onboarded',
        },
      ],
    };

    mockedOnboardOnp.mockResolvedValue(mockResponse);

    renderWithQueryClient(<OnboardForm />);

    // Select criteria
    const mongodbCheckbox = screen.getByLabelText(/MongoDB and Redis/i);
    await user.click(mongodbCheckbox);

    // Fill in required fields
    const eventNameInput = screen.getByPlaceholderText(/Enter event name/i);
    await user.type(eventNameInput, 'test-event');

    const subscriberNameInput = screen.getByPlaceholderText(/Enter subscriber name/i);
    await user.type(subscriberNameInput, 'test-subscriber');

    // Wait for validation to pass
    await waitFor(() => {
      expect(screen.getByText(/All validations passed/i)).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit Onboarding Request/i });
    await user.click(submitButton);

    // Wait for API call
    await waitFor(() => {
      expect(mockedOnboardOnp).toHaveBeenCalled();
    });

    // Check results are displayed
    await waitFor(() => {
      expect(screen.getByText(/mongoDBAndRedis/i)).toBeInTheDocument();
      expect(screen.getByText(/Successfully onboarded/i)).toBeInTheDocument();
    });
  });

  it('should prevent submission with invalid data', async () => {
    const user = userEvent.setup();

    renderWithQueryClient(<OnboardForm />);

    // Select criteria but don't fill required fields
    const mongodbCheckbox = screen.getByLabelText(/MongoDB and Redis/i);
    await user.click(mongodbCheckbox);

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /Submit Onboarding Request/i });
    expect(submitButton).toBeDisabled();

    // API should not be called
    expect(mockedOnboardOnp).not.toHaveBeenCalled();
  });

  it('should display error when API call fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Network error';
    mockedOnboardOnp.mockRejectedValue(new Error(errorMessage));

    renderWithQueryClient(<OnboardForm />);

    // Select criteria and fill minimal required fields
    const mongodbCheckbox = screen.getByLabelText(/MongoDB and Redis/i);
    await user.click(mongodbCheckbox);

    const eventNameInput = screen.getByPlaceholderText(/Enter event name/i);
    await user.type(eventNameInput, 'test-event');

    const subscriberNameInput = screen.getByPlaceholderText(/Enter subscriber name/i);
    await user.type(subscriberNameInput, 'test-subscriber');

    // Wait for validation
    await waitFor(() => {
      expect(screen.getByText(/All validations passed/i)).toBeInTheDocument();
    });

    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit Onboarding Request/i });
    await user.click(submitButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});

