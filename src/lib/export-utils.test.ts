import { serializeComplexData, convertToCSV, exportTableToCSV, exportTableToJSON } from './export-utils';

describe('export-utils', () => {
  describe('serializeComplexData', () => {
    it('returns empty string for null or undefined', () => {
      expect(serializeComplexData(null)).toBe('');
      expect(serializeComplexData(undefined)).toBe('');
    });

    it('stringifies objects', () => {
      const obj = { a: 1, b: 'two' };
      expect(serializeComplexData(obj)).toBe('{"a":1,"b":"two"}');
    });

    it('stringifies arrays', () => {
      const arr = [1, 2, 'three'];
      expect(serializeComplexData(arr)).toBe('[1,2,"three"]');
    });

    it('returns string representation for primitives', () => {
      expect(serializeComplexData(123)).toBe('123');
      expect(serializeComplexData(true)).toBe('true');
      expect(serializeComplexData('hello')).toBe('hello');
    });

    it('handles object stringify errors by casting to string', () => {
      const circularObj: Record<string, unknown> = {};
      circularObj.circularRef = circularObj;
      expect(serializeComplexData(circularObj)).toBe('[object Object]');
    });
  });

  describe('convertToCSV', () => {
    it('returns empty string for empty data', () => {
      expect(convertToCSV([])).toBe('');
    });

    it('generates CSV with headers and rows correctly', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const result = convertToCSV(data);
      expect(result).toBe('"name","age"\n"Alice","30"\n"Bob","25"');
    });

    it('escapes quotes within string values', () => {
      const data = [
        { note: 'He said "Hello"' },
      ];
      const result = convertToCSV(data);
      expect(result).toBe('"note"\n"He said ""Hello"""');
    });

    it('serializes complex objects inside CSV', () => {
      const data = [
        { id: 1, metadata: { tags: ['a', 'b'] } },
      ];
      const result = convertToCSV(data);
      expect(result).toBe('"id","metadata"\n"1","{""tags"":[""a"",""b""]}"');
    });

    it('handles varying keys across objects', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, age: 30 },
      ];
      const result = convertToCSV(data);
      expect(result).toBe('"id","name","age"\n"1","Alice",""\n"2","","30"');
    });
  });

  describe('exportTableToCSV and exportTableToJSON', () => {
    let clickSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;
    let mockAnchor: HTMLAnchorElement;

    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      clickSpy = jest.fn();
      mockAnchor = {
        href: '',
        download: '',
        click: clickSpy,
      } as unknown as HTMLAnchorElement;

      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('exports CSV by creating a blob and triggering download', () => {
      const data = [{ id: 1, name: 'Test' }];
      exportTableToCSV(data, 'test.csv');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('test.csv');
      expect(mockAnchor.href).toBe('mock-url');
      expect(clickSpy).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('exports JSON by creating a blob and triggering download', () => {
      const data = [{ id: 1, name: 'Test' }];
      exportTableToJSON(data, 'test.json');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('test.json');
      expect(mockAnchor.href).toBe('mock-url');
      expect(clickSpy).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
  });
});
