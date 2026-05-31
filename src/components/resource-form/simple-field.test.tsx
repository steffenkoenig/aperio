import React from 'react';
import { render, screen } from '@testing-library/react';
import { SimpleField } from './simple-field';
import { SchemaObject } from '@/lib/types';
import '@testing-library/jest-dom';

describe('SimpleField', () => {
  const defaultProps = {
    name: 'testSimple',
    value: undefined,
    onChange: jest.fn(),
    required: false,
    label: 'Test Simple',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a checkbox when type is boolean', () => {
    const schema: SchemaObject = { type: 'boolean' };
    render(<SimpleField {...defaultProps} schema={schema} type="boolean" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders a select when schema.enum is provided', () => {
    const schema: SchemaObject = { type: 'string', enum: ['Option 1', 'Option 2'] };
    render(<SimpleField {...defaultProps} schema={schema} type="string" />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
  });

  it('renders a standard input for strings', () => {
    const schema: SchemaObject = { type: 'string' };
    render(<SimpleField {...defaultProps} schema={schema} type="string" />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });
});
