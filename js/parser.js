/**
 * Parser Module - Tách chuỗi văn bản thành danh sách danh từ/thẻ
 */
const ParserModule = {
  parseText(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];

    const lines = rawText.split(/\r?\n/);
    const result = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Hỗ trợ các ký tự phân cách: |, TAB, ,, -
      let parts = [];
      if (trimmed.includes('|')) {
        parts = trimmed.split('|');
      } else if (trimmed.includes('\t')) {
        parts = trimmed.split('\t');
      } else if (trimmed.includes(',')) {
        parts = trimmed.split(',');
      } else if (trimmed.includes('-')) {
        parts = trimmed.split('-');
      } else {
        parts = [trimmed];
      }

      parts = parts.map(p => p.trim());

      if (parts.length >= 3) {
        result.push({ hanzi: parts[0], pinyin: parts[1], meaning: parts[2] });
      } else if (parts.length === 2) {
        result.push({ hanzi: parts[0], pinyin: '', meaning: parts[1] });
      } else if (parts.length === 1 && parts[0] !== '') {
        result.push({ hanzi: parts[0], pinyin: '', meaning: parts[0] });
      }
    });

    return result;
  }
};