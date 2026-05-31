import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArrayField } from './array-field';
import { SchemaObject } from '@/lib/types';
import '@testing-library/jest-dom';

describe('ArrayField', () => {
  const defaultProps = {
    name: 'testArr',
    value: undefined,
    onChange: jest.fn(),
    required: false,
    components: {},
    label: 'Test Array',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "No items added" when array is empty', () => {
    const schema: SchemaObject = { type: 'array' };
    const itemSchema: SchemaObject = { type: 'object', properties: {} };
    render(<ArrayField {...defaultProps} schema={schema} itemSchema={itemSchema} value={[]} />);
    expect(screen.getByText('No items added')).toBeInTheDocument();
  });

  it('calls onChange with a new object when "Add Item" is clicked', () => {
    const schema: SchemaObject = { type: 'array' };
    const itemSchema: SchemaObject = { type: 'object', properties: {} };
    render(<ArrayField {...defaultProps} schema={schema} itemSchema={itemSchema} value={[]} />);

    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith([{}]);
  });

  it('splices the array when "Remove" is clicked', () => {
    const schema: SchemaObject = { type: 'array' };
    const itemSchema: SchemaObject = { type: 'object', properties: {} };
    render(<ArrayField {...defaultProps} schema={schema} itemSchema={itemSchema} value={[{}]} />);

    const removeButton = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith(undefined); // Since length drops to 0, onChange passes undefined
  });
});
