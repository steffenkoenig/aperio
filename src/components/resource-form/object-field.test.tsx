import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ObjectField } from './object-field';
import { SchemaObject } from '@/lib/types';
import '@testing-library/jest-dom';

describe('ObjectField', () => {
  const defaultProps = {
    name: 'testObj',
    value: undefined,
    onChange: jest.fn(),
    required: false,
    components: {},
    label: 'Test Object',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Empty Object" when properties are empty', () => {
    const schema: SchemaObject = { type: 'object', properties: {} };
    render(<ObjectField {...defaultProps} schema={schema} />);
    expect(screen.getByText('Empty Object')).toBeInTheDocument();
  });

  it('toggles visibility when collapse button is clicked', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: { child: { type: 'string' } },
    };
    render(<ObjectField {...defaultProps} schema={schema} />);

    // Initially not collapsed, so "Empty Object" or subfield logic is visible. We check subfield label "child".
    expect(screen.getByText('child')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /Test Object/i });
    fireEvent.click(button); // collapse

    // The subfield should no longer be visible
    expect(screen.queryByText('child')).not.toBeInTheDocument();
  });
});
