import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

// Component that throws an error on demand
const ThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({
  shouldThrow,
}) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  // Suppress React's error logging during boundary tests
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  beforeEach(() => {
    consoleErrorSpy.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should render error fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('¡Uy!')).toBeInTheDocument();
    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
  });

  it('should render "Intentar de nuevo" button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(
      screen.getByRole('button', { name: /Intentar de nuevo/i })
    ).toBeInTheDocument();
  });

  it('should reset error state when "Intentar de nuevo" is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );

    // Update children to non-throwing BEFORE clicking "Intentar de nuevo" so that
    // when the boundary resets, the children won't throw again
    rerender(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /Intentar de nuevo/i }));

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should not render the error fallback when no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    );
    expect(screen.queryByText('¡Uy!')).not.toBeInTheDocument();
    const tryAgain = screen.queryByRole('button', {
      name: /Intentar de nuevo/i,
    });
    expect(tryAgain).not.toBeInTheDocument();
  });

  it('should log the error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
