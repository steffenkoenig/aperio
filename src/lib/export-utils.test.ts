import { convertToCSV, serializeComplexData } from './export-utils';

describe('export-utils', () => {
  describe('serializeComplexData', () => {
    it('returns empty string for null or undefined', () => {
      expect(serializeComplexData(null)).toBe('');
      expect(serializeComplexData(undefined)).toBe('');
    });

    it('returns string representation for primitives', () => {
      expect(serializeComplexData(123)).toBe('123');
      expect(serializeComplexData('test')).toBe('test');
      expect(serializeComplexData(true)).toBe('true');
      expect(serializeComplexData(false)).toBe('false');
    });

    it('serializes objects to JSON', () => {
      const obj = { key: 'value', num: 1 };
      expect(serializeComplexData(obj)).toBe('{"key":"value","num":1}');
    });

    it('serializes arrays to JSON', () => {
      const arr = [1, 'two', { three: 3 }];
      expect(serializeComplexData(arr)).toBe('[1,"two",{"three":3}]');
    });

    it('handles circular references gracefully by falling back to String()', () => {
      const obj: Record<string, unknown> = {};
      obj.self = obj;
      expect(serializeComplexData(obj)).toBe('[object Object]');
    });
  });

  describe('convertToCSV', () => {
    it('returns empty string for empty array', () => {
      expect(convertToCSV([])).toBe('');
    });

    it('converts simple data to CSV', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const result = convertToCSV(data);
      expect(result).toBe('"id","name"\n"1","Alice"\n"2","Bob"');
    });

    it('handles missing keys in some rows', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, age: 30 },
      ];
      const result = convertToCSV(data);
      expect(result).toBe('"id","name","age"\n"1","Alice",""\n"2","","30"');
    });

    it('escapes quotes within values', () => {
      const data = [
        { id: 1, quote: 'He said "Hello"' },
      ];
      const result = convertToCSV(data);
      expect(result).toBe('"id","quote"\n"1","He said ""Hello"""');
    });

    it('serializes complex objects inside CSV', () => {
      const data = [
        { id: 1, details: { role: 'admin' } },
      ];
      const result = convertToCSV(data);
      expect(result).toBe('"id","details"\n"1","{""role"":""admin""}"');
    });

    it('serializes arrays inside CSV', () => {
      const data = [
        { id: 1, tags: ['a', 'b'] },
      ];
      const result = convertToCSV(data);
      expect(result).toBe('"id","tags"\n"1","[""a"",""b""]"');
    });
  });
});
