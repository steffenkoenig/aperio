import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';

describe('Input Component', () => {
  it('renders an input correctly', () => {
    render(<Input placeholder="Enter text" />);
    const inputElement = screen.getByPlaceholderText(/enter text/i);
    expect(inputElement).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const handleChange = jest.fn();
    render(<Input placeholder="Enter text" onChange={handleChange} />);
    const inputElement = screen.getByPlaceholderText(/enter text/i);
    fireEvent.change(inputElement, { target: { value: 'New text' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(inputElement).toHaveValue('New text');
  });

  it('applies custom class names', () => {
    render(<Input placeholder="Enter text" className="custom-input-class" />);
    const inputElement = screen.getByPlaceholderText(/enter text/i);
    expect(inputElement).toHaveClass('custom-input-class');
  });
});
