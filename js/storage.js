/**
 * Storage Module - Quản lý lưu trữ bộ thẻ KAIKOU
 * trong LocalStorage.
 */
const StorageModule = {
  STORAGE_KEY: 'kaikou_flashcard_studio_deck',

  saveDeck(deck) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(deck));
    } catch (e) {
      console.error('Lỗi khi lưu vào LocalStorage:', e);
    }
  },

  loadDeck() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Lỗi khi đọc LocalStorage:', e);
      return null;
    }
  }
};