import { render, screen } from '@testing-library/react';
import { ValidationPanel } from '../ValidationPanel';
import type { ValidationError } from '../../types';

describe('ValidationPanel', () => {
  it('should display validation passed message when valid', () => {
    render(
      <ValidationPanel
        errors={[]}
        requestCriteria={['mongodbandredis']}
        isValid={true}
      />
    );

    expect(screen.getByText(/All validations passed/i)).toBeInTheDocument();
  });

  it('should display validation errors when invalid', () => {
    const errors: ValidationError[] = [
      { field: 'eventName', message: 'Event name is required' },
      { field: 'subscriberName', message: 'Subscriber name is required' },
    ];

    render(
      <ValidationPanel
        errors={errors}
        requestCriteria={['mongodbandredis']}
        isValid={false}
      />
    );

    expect(screen.getByText(/2 validation error\(s\) found/i)).toBeInTheDocument();
    expect(screen.getByText(/eventName:/i)).toBeInTheDocument();
    expect(screen.getByText(/subscriberName:/i)).toBeInTheDocument();
  });

  it('should display tasks that will run', () => {
    render(
      <ValidationPanel
        errors={[]}
        requestCriteria={['mongodbandredis', 'kafkatopic']}
        isValid={true}
      />
    );

    expect(screen.getByText(/Tasks that will run:/i)).toBeInTheDocument();
    expect(screen.getByText(/mongoDBAndRedis/i)).toBeInTheDocument();
    expect(screen.getByText(/kafka/i)).toBeInTheDocument();
  });

  it('should display message when no criteria selected', () => {
    render(
      <ValidationPanel
        errors={[]}
        requestCriteria={[]}
        isValid={true}
      />
    );

    expect(screen.getByText(/No criteria selected/i)).toBeInTheDocument();
  });
});

