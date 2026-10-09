/**
 * Main Application Module - Điều phối hoạt động KAIKOU Flashcard Studio
 */
document.addEventListener('DOMContentLoaded', () => {
  // Bộ dữ liệu khởi tạo mặc định
  let deck = [
    { hanzi: '新', pinyin: 'xīn', meaning: 'Mới' },
    { hanzi: '同學', pinyin: 'tóngxué', meaning: 'Bạn học' },
    { hanzi: '她', pinyin: 'tā', meaning: 'Cô ấy' },
    { hanzi: '誰', pinyin: 'shéi', meaning: 'Ai' },
    { hanzi: '叫', pinyin: 'jiào', meaning: 'Tên là / gọi là' }
  ];

  const flashcard = new FlashcardModule();
  const pagination = new PaginationModule();

  // Elements UI
  const cardElement = document.getElementById('flashcard');
  const cardBadge = document.getElementById('card-badge');
  const cardText = document.getElementById('card-text');
  const cardSubtext = document.getElementById('card-subtext');
  const cardCounter = document.getElementById('card-counter');
  const progressBar = document.getElementById('progress-bar');
  
  const modeSelect = document.getElementById('mode-select');
  const langSelect = document.getElementById('lang-select');
  const autoTts = document.getElementById('auto-tts');
  const fileInput = document.getElementById('file-input');

  // Kiểm tra bộ nhớ LocalStorage
  const savedDeck = StorageModule.loadDeck();
  if (savedDeck && savedDeck.length > 0) {
    deck = savedDeck;
  }

  pagination.setTotal(deck.length);
  updateUI();

  // Cập nhật giao diện Flashcard
  function updateUI() {
    if (deck.length === 0) {
      cardBadge.textContent = 'Trống';
      cardText.textContent = 'Chưa có thẻ nào';
      cardSubtext.textContent = '';
      cardCounter.textContent = '0 / 0';
      progressBar.style.width = '0%';
      return;
    }

    const currentCard = deck[pagination.currentIndex];
    const info = flashcard.getFaceInfo(currentCard);

    cardBadge.textContent = info.badge;
    cardText.textContent = info.text;
    cardSubtext.textContent = info.subtext;

    cardCounter.textContent = `${pagination.currentIndex + 1} / ${deck.length}`;
    progressBar.style.width = `${((pagination.currentIndex + 1) / deck.length) * 100}%`;

    if (autoTts.checked && flashcard.currentFace === 1) {
      playTTS(currentCard.hanzi);
    }
  }

  // 🔊 Hàm playTTS được tối ưu hóa đặc biệt cho thiết bị di động (Mobile / iOS / Android)
  function playTTS(text) {
    if (!text) return;
    if (!('speechSynthesis' in window)) {
      console.warn('Trình duyệt không hỗ trợ phát âm (SpeechSynthesis).');
      return;
    }

    // Hủy bỏ luồng âm thanh đang kẹt trước đó
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langSelect.value || 'zh-TW'; // Đảm bảo luôn có ngôn ngữ dự phòng
    utterance.rate = 0.9; // Tốc độ đọc chuẩn

    // Xử lý lấy giọng đọc tối ưu trên Mobile
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const selectedLang = langSelect.value;
      const targetVoice = voices.find(v => v.lang === selectedLang || v.lang.replace('_', '-') === selectedLang || v.lang.includes('zh'));
      if (targetVoice) {
        utterance.voice = targetVoice;
      }
    }

    // Thực hiện phát âm
    window.speechSynthesis.speak(utterance);
  }

  // Lắng nghe sự kiện nạp giọng đọc cho trình duyệt di động (Chrome Android / Safari iOS)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // Điều khiển lật thẻ & chuyển bài
  function handleFlip() {
    flashcard.flip();
    updateUI();
  }

  function handleNext() {
    flashcard.resetFace();
    pagination.next();
    updateUI();
  }

  function handlePrev() {
    flashcard.resetFace();
    pagination.prev();
    updateUI();
  }

  // Gắn sự kiện nút tương tác
  cardElement.addEventListener('click', handleFlip);
  document.getElementById('btn-flip').addEventListener('click', handleFlip);
  document.getElementById('btn-next').addEventListener('click', handleNext);
  document.getElementById('btn-prev').addEventListener('click', handlePrev);

  document.getElementById('btn-shuffle').addEventListener('click', () => {
    deck.sort(() => Math.random() - 0.5);
    pagination.reset();
    flashcard.resetFace();
    updateUI();
  });

  document.getElementById('btn-tts').addEventListener('click', (e) => {
    e.stopPropagation();
    if (deck.length > 0) {
      playTTS(deck[pagination.currentIndex].hanzi);
    }
  });

  modeSelect.addEventListener('change', (e) => {
    flashcard.setMode(e.target.value);
    updateUI();
  });

  // 1. Nhập dữ liệu dán văn bản
  document.getElementById('btn-parse-text').addEventListener('click', () => {
    const text = document.getElementById('paste-input').value;
    const parsed = ParserModule.parseText(text);
    if (parsed.length > 0) {
      deck = parsed;
      StorageModule.saveDeck(deck);
      pagination.setTotal(deck.length);
      pagination.reset();
      flashcard.resetFace();
      updateUI();
      alert(`Đã nạp thành công ${parsed.length} thẻ!`);
    } else {
      alert('Không tìm thấy dữ liệu hợp lệ từ đoạn văn bản đã dán.');
    }
  });

  // 2. 🔥 Xử lý sự kiện Tải Tệp Lên
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    cardText.textContent = '⏳ Đang đọc tệp...';
    cardSubtext.textContent = file.name;

    try {
      const importedDeck = await ImporterModule.importFile(file);
      if (importedDeck && importedDeck.length > 0) {
        deck = importedDeck;
        StorageModule.saveDeck(deck);
        pagination.setTotal(deck.length);
        pagination.reset();
        flashcard.resetFace();
        updateUI();
        alert(`🎉 Nạp thành công ${importedDeck.length} thẻ từ tệp "${file.name}"!`);
      } else {
        alert('Không trích xuất được dữ liệu thẻ nào từ tệp này.');
        updateUI();
      }
    } catch (err) {
      alert(`❌ Lỗi khi đọc file: ${err.message}`);
      updateUI();
    } finally {
      fileInput.value = '';
    }
  });

  // Gắn sự kiện Xuất tệp
  
const exportButtons = [
  ['btn-export-pptx', () => ExporterModule.exportPPTX(deck)],
  ['btn-export-pdf', () => ExporterModule.exportPDF(deck)],
  ['btn-export-html', () => ExporterModule.exportHTML(deck)],
];

exportButtons.forEach(([id, exportFile]) => {
  const button = document.getElementById(id);

  if (button) {
    button.addEventListener('click', exportFile);
  } else {
    console.warn(`Không tìm thấy nút xuất tệp: ${id}`);
  }
});

});