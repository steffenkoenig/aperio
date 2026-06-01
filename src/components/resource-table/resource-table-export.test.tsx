import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceTable } from './index';
import { exportTableToCSV, exportTableToJSON } from '../../lib/export-utils';
import { useResourceTable } from './hooks/useResourceTable';

// Radix DropdownMenu uses pointer down events rather than click events
window.PointerEvent = class PointerEvent extends Event {
  constructor(type: string, props?: PointerEventInit) {
    super(type, props);
  }
} as unknown as typeof window.PointerEvent;

jest.mock('../../lib/export-utils', () => ({
  exportTableToCSV: jest.fn(),
  exportTableToJSON: jest.fn(),
}));

jest.mock('./hooks/useResourceTable', () => ({
  useResourceTable: jest.fn(),
}));

jest.mock('../../store/spec-store', () => ({
  useSpecStore: () => ({
    specSource: 'test-source',
    preferences: {},
    saveView: jest.fn(),
    deleteView: jest.fn(),
  }),
}));

const mockData = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

describe('ResourceTable - Export functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup generic implementation for useResourceTable
    (useResourceTable as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      sorting: [],
      setSorting: jest.fn(),
      globalFilter: '',
      setGlobalFilter: jest.fn(),
      error: null,
      fetchData: jest.fn(),
    });

    // Mock Date.now or new Date for consistent filenames in some cases
    jest.useFakeTimers().setSystemTime(new Date('2023-10-27T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the Export button', () => {
    render(<ResourceTable path="/users" />);
    const exportButton = screen.getByRole('button', { name: /Export/i });
    expect(exportButton).toBeInTheDocument();
    expect(exportButton).not.toBeDisabled();
  });

  it('calls exportTableToCSV with correct data and filename when Export as CSV is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ResourceTable path="/api/v1/users" />);

    // Open dropdown
    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    // Click CSV
    const csvOption = await screen.findByText(/Export as CSV/i);
    await act(async () => {
      fireEvent.click(csvOption);
    });

    expect(exportTableToCSV).toHaveBeenCalledTimes(1);
    expect(exportTableToCSV).toHaveBeenCalledWith(
      mockData,
      'users_export_2023-10-27.csv'
    );
  });

  it('calls exportTableToJSON with correct data and filename when Export as JSON is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ResourceTable path="/api/v1/users" />);

    // Open dropdown
    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    // Click JSON
    const jsonOption = await screen.findByText(/Export as JSON/i);
    await act(async () => {
      fireEvent.click(jsonOption);
    });

    expect(exportTableToJSON).toHaveBeenCalledTimes(1);
    expect(exportTableToJSON).toHaveBeenCalledWith(
      mockData,
      'users_export_2023-10-27.json'
    );
  });

  it('uses "export" as fallback resource name if path is empty or malformed', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ResourceTable path="/" />);

    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    const csvOption = await screen.findByText(/Export as CSV/i);
    await act(async () => {
      fireEvent.click(csvOption);
    });

    expect(exportTableToCSV).toHaveBeenCalledWith(
      mockData,
      'export_export_2023-10-27.csv'
    );
  });

  it('disables the Export button when there is no data or is loading', () => {
    (useResourceTable as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      sorting: [],
      setSorting: jest.fn(),
      globalFilter: '',
      setGlobalFilter: jest.fn(),
      error: null,
      fetchData: jest.fn(),
    });

    const { rerender } = render(<ResourceTable path="/users" />);
    let exportButton = screen.getByRole('button', { name: /Export/i });
    expect(exportButton).toBeDisabled();

    (useResourceTable as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: true,
      sorting: [],
      setSorting: jest.fn(),
      globalFilter: '',
      setGlobalFilter: jest.fn(),
      error: null,
      fetchData: jest.fn(),
    });

    rerender(<ResourceTable path="/users" />);
    exportButton = screen.getByRole('button', { name: /Export/i });
    expect(exportButton).toBeDisabled();
  });
});