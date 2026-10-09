/**
 * Flashcard Module - Logic xoay mặt thẻ, quản lý trạng thái hiển thị
 */
class FlashcardModule {
  constructor() {
    this.currentFace = 1; // 1, 2, 3
    this.mode = 3; // 2 mặt hoặc 3 mặt
  }

  setMode(mode) {
    this.mode = parseInt(mode, 10);
    this.resetFace();
  }

  resetFace() {
    this.currentFace = 1;
  }

  flip() {
    if (this.mode === 2) {
      this.currentFace = this.currentFace === 1 ? 2 : 1;
    } else {
      this.currentFace = (this.currentFace % 3) + 1;
    }
    return this.currentFace;
  }

  getFaceInfo(cardData) {
    if (!cardData) return { badge: '', text: 'Không có dữ liệu', subtext: '' };

    if (this.mode === 2) {
      if (this.currentFace === 1) {
        return { badge: 'Mặt 1: Từ vựng', text: cardData.hanzi, subtext: cardData.pinyin };
      } else {
        return { badge: 'Mặt 2: Nghĩa', text: cardData.meaning, subtext: '' };
      }
    } else {
      if (this.currentFace === 1) {
        return { badge: 'Mặt 1: Từ vựng', text: cardData.hanzi, subtext: '' };
      } else if (this.currentFace === 2) {
        return { badge: 'Mặt 2: Phiên âm', text: cardData.pinyin || cardData.hanzi, subtext: '' };
      } else {
        return { badge: 'Mặt 3: Nghĩa', text: cardData.meaning, subtext: '' };
      }
    }
  }
}