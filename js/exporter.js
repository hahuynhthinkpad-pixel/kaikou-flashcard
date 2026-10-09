/**
 * Exporter Module - Xuất tệp PPTX, PDF, HTML, JSON, CSV cho KAIKOU
 */
const ExporterModule = {
  exportJSON(deck) {
    if (!deck || deck.length === 0) return alert('Bộ thẻ đang trống!');
    const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
    this.downloadBlob(blob, 'kaikou-flashcard-deck.json');
  },

  exportCSV(deck) {
    if (!deck || deck.length === 0) return alert('Bộ thẻ đang trống!');
    let csvContent = '\uFEFFHanzi,Pinyin,Meaning\n';
    deck.forEach(item => {
      csvContent += `"${item.hanzi || ''}","${item.pinyin || ''}","${item.meaning || ''}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, 'kaikou-flashcard-deck.csv');
  },

  exportPPTX(deck) {
    if (!deck || deck.length === 0) return alert('Bộ thẻ đang trống!');
    if (typeof PptxGenJS === 'undefined') return alert('Thư viện PPTX chưa tải xong!');
    
    const pptx = new PptxGenJS();
    
    deck.forEach((item, index) => {
      const slide = pptx.addSlide();
      slide.addText(`KAIKOU 華語開口 • Card ${index + 1} / ${deck.length}`, { x: 0.5, y: 0.4, fontSize: 12, color: '888888' });
      slide.addText(item.hanzi || '', { x: 1.0, y: 1.5, fontSize: 44, bold: true, align: 'center', w: '80%' });
      if (item.pinyin) {
        slide.addText(item.pinyin, { x: 1.0, y: 2.8, fontSize: 22, color: '0088CC', align: 'center', w: '80%' });
      }
      slide.addText(item.meaning || '', { x: 1.0, y: 3.8, fontSize: 26, align: 'center', w: '80%' });
    });

    pptx.writeFile({ fileName: 'kaikou-flashcard-presentation.pptx' });
  },

  exportPDF(deck) {
    if (!deck || deck.length === 0) return alert('Bộ thẻ đang trống!');
    if (!window.jspdf) return alert('Thư viện PDF chưa tải xong!');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("KAIKOU Flashcard Studio — 華語開口", 20, 20);

    let y = 35;
    deck.forEach((item, index) => {
      if (y > 270) { 
        doc.addPage(); 
        y = 20; 
      }
      doc.setFontSize(13);
      const textLine = `${index + 1}. ${item.hanzi || ''} ${item.pinyin ? `(${item.pinyin})` : ''} : ${item.meaning || ''}`;
      doc.text(textLine, 20, y);
      y += 10;
    });

    doc.save('kaikou-flashcard-deck.pdf');
  },

  exportHTML(deck) {
    if (!deck || deck.length === 0) return alert('Bộ thẻ đang trống!');

    const htmlTemplate = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KAIKOU Offline Flashcards — 華語開口</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .header { margin-bottom: 20px; text-align: center; }
    .header h1 { font-size: 1.5rem; color: #38bdf8; }
    .card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid #38bdf8; border-radius: 16px; padding: 40px 24px; width: 100%; max-width: 500px; min-height: 260px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; cursor: pointer; user-select: none; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .badge { font-size: 0.8rem; font-weight: bold; color: #38bdf8; letter-spacing: 1px; }
    .text { font-size: 2.8rem; font-weight: bold; color: #f8fafc; margin: 20px 0; word-break: break-word; }
    .hint { font-size: 0.85rem; color: #64748b; }
    .controls { display: flex; gap: 10px; margin-top: 20px; width: 100%; max-width: 500px; justify-content: center; }
    button { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: bold; transition: opacity 0.2s; }
    button.sec { background: #475569; }
    button:hover { opacity: 0.9; }
    .counter { margin-top: 15px; color: #94a3b8; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎴 KAIKOU Flashcards</h1>
  </div>

  <div class="card" id="card">
    <div class="badge" id="badge">MẶT 1: TỪ VỰNG</div>
    <div class="text" id="text">...</div>
    <div class="hint">Chạm vào thẻ để lật mặt</div>
  </div>

  <div class="controls">
    <button class="sec" onclick="prevCard()">⬅️ Trước</button>
    <button onclick="flipCard()">🔄 Lật thẻ</button>
    <button class="sec" onclick="nextCard()">Sau ➡️</button>
  </div>

  <div class="counter" id="counter">0 / 0</div>

  <script>
    const deckData = ${JSON.stringify(deck, null, 2)};
    let currentIndex = 0;
    let currentFace = 1;

    function renderCard() {
      if (!deckData || deckData.length === 0) return;
      const item = deckData[currentIndex];
      const badgeEl = document.getElementById('badge');
      const textEl = document.getElementById('text');
      const counterEl = document.getElementById('counter');

      if (currentFace === 1) {
        badgeEl.textContent = 'MẶT 1: TỪ VỰNG';
        textEl.textContent = item.hanzi || '';
      } else if (currentFace === 2) {
        badgeEl.textContent = 'MẶT 2: PHIÊN ÂM';
        textEl.textContent = item.pinyin || item.hanzi || '';
      } else {
        badgeEl.textContent = 'MẶT 3: NGHĨA';
        textEl.textContent = item.meaning || '';
      }
      counterEl.textContent = (currentIndex + 1) + ' / ' + deckData.length;
    }

    function flipCard() {
      currentFace = (currentFace % 3) + 1;
      renderCard();
    }

    function nextCard() {
      currentFace = 1;
      currentIndex = (currentIndex + 1) % deckData.length;
      renderCard();
    }

    function prevCard() {
      currentFace = 1;
      currentIndex = (currentIndex - 1 + deckData.length) % deckData.length;
      renderCard();
    }

    document.getElementById('card').addEventListener('click', flipCard);
    renderCard();
  <\/script>
</body>
</html>`;

    const blob = new Blob([htmlTemplate], { type: 'text/html;charset=utf-8;' });
    this.downloadBlob(blob, 'kaikou-flashcard-deck.html');
  },

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};