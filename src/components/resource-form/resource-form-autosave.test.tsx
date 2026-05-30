import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ResourceForm } from './index';
import { useSpecStore } from '../../../src/store/spec-store';

jest.mock('../../../src/store/spec-store', () => ({
  useSpecStore: jest.fn(),
}));

const mockOperation = {
  operationId: 'createPet',
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      },
    },
  },
};

const mockGetActiveEnvironment = jest.fn().mockReturnValue({ baseUrl: 'http://api.test', authType: 'none' });

describe('ResourceForm Auto-Save', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (useSpecStore as unknown as jest.Mock).mockReturnValue({
      getActiveEnvironment: mockGetActiveEnvironment,
      parsedSpec: { title: 'TestSpec', raw: { components: {} } },
    });

    // Mock fetch for submission
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads draft from localStorage on mount', async () => {
    const draftKey = 'draft_TestSpec_POST_/pets';
    localStorage.setItem(draftKey, JSON.stringify({ name: 'Fido' }));

    render(<ResourceForm path="/pets" method="POST" operation={mockOperation} />);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Fido');
      expect(input).toBeInTheDocument();
    });
  });

  it('saves form data to localStorage', async () => {
    jest.useFakeTimers();
    render(<ResourceForm path="/pets" method="POST" operation={mockOperation} />);

    // Advance timers so the initial draft load effect finishes
    act(() => {
      jest.advanceTimersByTime(0);
    });

    const button = screen.getByText('name'); // Click to expand object
    fireEvent.click(button);

    // After expanding, find the input. It might not have an aria-label immediately, but let's grab it by role.
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Buddy' } });

    // Wait for the 500ms debounce
    jest.advanceTimersByTime(600);

    const draftKey = 'draft_TestSpec_POST_/pets';
    const saved = localStorage.getItem(draftKey);
    expect(saved).toBeTruthy();
    expect(JSON.parse(saved!)).toEqual({ name: 'Buddy' });

    jest.useRealTimers();
  });

  it('clears draft on successful submit', async () => {
    const draftKey = 'draft_TestSpec_POST_/pets';
    localStorage.setItem(draftKey, JSON.stringify({ name: 'Fido' }));

    render(<ResourceForm path="/pets" method="POST" operation={mockOperation} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fido')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /POST/ });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(localStorage.getItem(draftKey)).toBeNull();
    });
  });

  it('discards draft when clicking Discard button', async () => {
    const draftKey = 'draft_TestSpec_POST_/pets';
    localStorage.setItem(draftKey, JSON.stringify({ name: 'Fido' }));

    render(<ResourceForm path="/pets" method="POST" operation={mockOperation} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fido')).toBeInTheDocument();
    });

    const discardBtn = screen.getByText('Discard Draft');
    fireEvent.click(discardBtn);

    await waitFor(() => {
      expect(localStorage.getItem(draftKey)).toBeNull();
      expect(screen.queryByDisplayValue('Fido')).not.toBeInTheDocument();
    });
  });
});
