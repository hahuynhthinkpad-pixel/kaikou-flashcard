/**
 * Pagination Module - Quản lý chỉ số thẻ và tiến trình
 */
class PaginationModule {
  constructor() {
    this.currentIndex = 0;
    this.totalCards = 0;
  }

  setTotal(total) {
    this.totalCards = total;
    if (this.currentIndex >= total) this.currentIndex = 0;
  }

  next() {
    if (this.totalCards === 0) return 0;
    this.currentIndex = (this.currentIndex + 1) % this.totalCards;
    return this.currentIndex;
  }

  prev() {
    if (this.totalCards === 0) return 0;
    this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
    return this.currentIndex;
  }

  reset() {
    this.currentIndex = 0;
  }
}