/**
 * Importer Module - Trích xuất văn bản & dữ liệu từ các tệp tải lên
 */
const ImporterModule = {
  async importFile(file) {
    if (!file) return [];
    
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop();

    try {
      if (['xlsx', 'xls'].includes(extension)) {
        return await this.parseExcel(file);
      } else if (extension === 'json') {
        return await this.parseJSON(file);
      } else if (['csv', 'txt'].includes(extension)) {
        return await this.parseTextFile(file);
      } else if (extension === 'docx') {
        return await this.parseDocx(file);
      } else if (extension === 'pdf') {
        return await this.parsePDF(file);
      } else if (extension === 'pptx') {
        return await this.parsePPTX(file);
      } else {
        throw new Error('Định dạng tệp không được hỗ trợ!');
      }
    } catch (err) {
      console.error('Lỗi khi đọc file:', err);
      throw err;
    }
  },

  // 1. Xử lý File Excel (.xlsx, .xls)
  parseExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const result = [];
          rows.forEach(row => {
            if (!row || row.length === 0) return;
            // Nếu có ít nhất 1 cột
            const col0 = String(row[0] || '').trim();
            const col1 = String(row[1] || '').trim();
            const col2 = String(row[2] || '').trim();

            if (col0) {
              result.push({
                hanzi: col0,
                pinyin: col1,
                meaning: col2 || col1
              });
            }
          });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  // 2. Xử lý File JSON (.json)
  parseJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed)) {
            resolve(parsed.map(item => ({
              hanzi: item.hanzi || item.word || item.front || '',
              pinyin: item.pinyin || item.reading || '',
              meaning: item.meaning || item.back || item.definition || ''
            })));
          } else {
            reject(new Error('File JSON phải chứa một mảng danh sách thẻ!'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file, 'UTF-8');
    });
  },

  // 3. Xử lý File Văn Bản (.txt, .csv)
  parseTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const parsed = ParserModule.parseText(text);
        resolve(parsed);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file, 'UTF-8');
    });
  },

  // 4. Xử lý File Word (.docx)
  parseDocx(file) {
    return new Promise((resolve, reject) => {
      if (typeof mammoth === 'undefined') {
        return reject(new Error('Thư viện mammoth.js chưa sẵn sàng!'));
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          const parsed = ParserModule.parseText(result.value);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  // 5. Xử lý File PDF (.pdf)
  parsePDF(file) {
    return new Promise((resolve, reject) => {
      if (typeof pdfjsLib === 'undefined') {
        return reject(new Error('Thư viện pdf.js chưa sẵn sàng!'));
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          const parsed = ParserModule.parseText(fullText);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  // 6. Xử lý File PowerPoint (.pptx)
  parsePPTX(file) {
    return new Promise((resolve, reject) => {
      if (typeof JSZip === 'undefined') {
        return reject(new Error('Thư viện JSZip chưa sẵn sàng!'));
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const zip = await JSZip.loadAsync(e.target.result);
          let extractedText = '';

          const slideFiles = Object.keys(zip.files).filter(fileName => fileName.startsWith('ppt/slides/slide'));
          
          for (const slideFile of slideFiles) {
            const xmlText = await zip.files[slideFile].async('string');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const textNodes = xmlDoc.getElementsByTagName('a:t');
            
            let slideLine = [];
            for (let node of textNodes) {
              slideLine.push(node.textContent);
            }
            extractedText += slideLine.join(' | ') + '\n';
          }

          const parsed = ParserModule.parseText(extractedText);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
};