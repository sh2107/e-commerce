/**
 * ÉLÉVATION ATELIER - WISHLIST ENGINE
 * Manages customer favorites, heart toggle states, and the slide-over wishlist drawer.
 */

class WishlistEngine {
  constructor() {
    this.wishlistIds = [];
    this.init();
  }

  async init() {
    this.wishlistIds = await api.getWishlist();
    this.updateWishlistBadge();
    this.renderWishlistDrawer();
  }

  isWishlisted(productId) {
    return this.wishlistIds.includes(productId);
  }

  async toggle(productId) {
    const res = await api.toggleWishlist(productId);
    this.wishlistIds = res.wishlist;
    this.updateWishlistBadge();
    this.renderWishlistDrawer();

    // Update heart button states in product cards & modal
    const buttons = document.querySelectorAll(`[data-wishlist-id="${productId}"]`);
    buttons.forEach(btn => {
      if (res.added) {
        btn.classList.add('active');
        btn.querySelector('i').className = 'bi bi-heart-fill';
      } else {
        btn.classList.remove('active');
        btn.querySelector('i').className = 'bi bi-heart';
      }
    });

    const product = await api.getProductById(productId);
    const prodName = product ? product.name : 'Item';

    if (res.added) {
      cartEngine.showToast(`Saved ${prodName} to your wishlist.`, 'success');
    } else {
      cartEngine.showToast(`Removed ${prodName} from your wishlist.`, 'info');
    }
  }

  updateWishlistBadge() {
    const badge = document.getElementById('wishlist-badge-count');
    if (badge) {
      badge.textContent = this.wishlistIds.length;
      badge.style.display = this.wishlistIds.length > 0 ? 'inline-block' : 'none';
    }
  }

  async renderWishlistDrawer() {
    const container = document.getElementById('wishlist-items-container');
    const emptyState = document.getElementById('wishlist-empty-state');
    if (!container) return;

    if (this.wishlistIds.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    const products = await Promise.all(
      this.wishlistIds.map(id => api.getProductById(id))
    );

    const validProducts = products.filter(p => p !== null);

    container.innerHTML = validProducts.map(p => `
      <div class="cart-item-row" id="wishlist-row-${p.id}">
        <img src="${p.image}" alt="${p.name}" class="cart-item-thumb">
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start">
            <h6 class="mb-1 font-editorial" style="font-size: 0.95rem;">${p.name}</h6>
            <button class="btn btn-sm text-muted-custom p-0 border-0" onclick="wishlistEngine.toggle('${p.id}')" title="Remove">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <p class="text-muted-custom mb-2" style="font-size: 0.8rem;">${p.tagline}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold" style="font-size: 0.95rem;">${cartEngine.formatPrice(p.price)}</span>
            <button class="btn btn-sm btn-atelier-dark py-1 px-3" style="font-size: 0.72rem;" onclick="catalogApp.openQuickView('${p.id}')">
              Select Size & Bag
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Global Wishlist Engine instance
const wishlistEngine = new WishlistEngine();
