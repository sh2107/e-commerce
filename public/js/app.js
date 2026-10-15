/**
 * ÉLÉVATION ATELIER - MAIN APP COORDINATOR
 * Connects UI events, faceted search/filtering, quick view PDP modal, and admin simulation.
 */

class CatalogApp {
  constructor() {
    this.currentFilters = {
      category: 'all',
      size: null,
      maxPrice: null,
      fit: null,
      sortBy: 'featured',
      query: ''
    };

    this.activeQuickProduct = null;
    this.selectedQuickSize = null;
    this.selectedQuickColor = null;

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.renderProducts();
  }

  setupEventListeners() {
    // Category Pills
    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        pills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilters.category = e.currentTarget.dataset.category;
        this.renderProducts();
      });
    });

    // Nav Category Links
    const navLinks = document.querySelectorAll('.nav-link-category');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = e.currentTarget.dataset.category;
        this.currentFilters.category = cat;

        // Sync pills
        pills.forEach(p => {
          if (p.dataset.category === cat) p.classList.add('active');
          else p.classList.remove('active');
        });

        // Scroll to catalog section
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        this.renderProducts();
      });
    });

    // Sorting Dropdown
    const sortSelect = document.getElementById('sort-products-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentFilters.sortBy = e.target.value;
        this.renderProducts();
      });
    }

    // Price Slider
    const priceSlider = document.getElementById('filter-price-slider');
    const priceDisplay = document.getElementById('filter-price-display');
    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener('input', (e) => {
        priceDisplay.textContent = `$${e.target.value}`;
        this.currentFilters.maxPrice = e.target.value;
        this.renderProducts();
      });
    }

    // Size Filter Pills in Filter Offcanvas
    const sizePills = document.querySelectorAll('.filter-size-btn');
    sizePills.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.classList.contains('active')) {
          e.target.classList.remove('active');
          this.currentFilters.size = null;
        } else {
          sizePills.forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.currentFilters.size = e.target.dataset.size;
        }
        this.renderProducts();
      });
    });

    // Fit Filter Pills
    const fitPills = document.querySelectorAll('.filter-fit-btn');
    fitPills.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.classList.contains('active')) {
          e.target.classList.remove('active');
          this.currentFilters.fit = null;
        } else {
          fitPills.forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.currentFilters.fit = e.target.dataset.fit;
        }
        this.renderProducts();
      });
    });

    // Reset Filters Button
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // Global Search Modal Input & Keyboard Shortcut (Cmd/Ctrl + K)
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilters.query = e.target.value;
        this.renderProducts();
      });
    }

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchModalEl = document.getElementById('modalSearch');
        if (searchModalEl && window.bootstrap) {
          const searchModal = bootstrap.Modal.getOrCreateInstance(searchModalEl);
          searchModal.show();
          setTimeout(() => document.getElementById('global-search-input')?.focus(), 250);
        }
      }
    });

    // Admin Stock Toggle simulation
    const adminToggle = document.getElementById('admin-mode-toggle');
    if (adminToggle) {
      adminToggle.addEventListener('change', (e) => {
        document.body.classList.toggle('admin-preview-active', e.target.checked);
        cartEngine.showToast(e.target.checked ? 'Admin Merchandiser Mode Activated' : 'Customer Storefront View Active', 'info');
        this.renderProducts();
      });
    }
  }

  resetFilters() {
    this.currentFilters = {
      category: 'all',
      size: null,
      maxPrice: null,
      fit: null,
      sortBy: 'featured',
      query: ''
    };

    document.querySelectorAll('.category-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.category === 'all');
    });

    document.querySelectorAll('.filter-size-btn, .filter-fit-btn').forEach(b => b.classList.remove('active'));

    const priceSlider = document.getElementById('filter-price-slider');
    const priceDisplay = document.getElementById('filter-price-display');
    if (priceSlider && priceDisplay) {
      priceSlider.value = 500;
      priceDisplay.textContent = '$500';
    }

    this.renderProducts();
  }

  async renderProducts() {
    const grid = document.getElementById('products-grid');
    const countEl = document.getElementById('product-count-display');
    if (!grid) return;

    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-dark" role="status"></div>
      </div>
    `;

    const products = await api.getProducts(this.currentFilters);

    if (countEl) {
      countEl.textContent = `Showing ${products.length} piece${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5 my-4">
          <i class="bi bi-search fs-1 text-muted"></i>
          <h4 class="font-editorial mt-3 mb-2">No garments match your selection</h4>
          <p class="text-muted small">Try refining your filters or search terms.</p>
          <button class="btn btn-atelier-dark btn-sm mt-2" onclick="catalogApp.resetFilters()">
            Clear All Filters
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(product => {
      const isWish = wishlistEngine.isWishlisted(product.id);
      const isLowStock = product.stock && Object.values(product.stock).some(qty => qty > 0 && qty <= 3);

      return `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4">
          <div class="product-card" id="card-${product.id}">
            <div class="product-media-wrap">
              <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
              
              <!-- Badges -->
              <div class="product-badge-group">
                ${product.isNew ? '<span class="badge-luxury badge-new">New Season</span>' : ''}
                ${product.compareAtPrice ? '<span class="badge-luxury badge-sale">Atelier Sale</span>' : ''}
                ${isLowStock ? '<span class="badge-luxury badge-low-stock">Few Left</span>' : ''}
              </div>

              <!-- Wishlist Heart Button -->
              <button 
                class="btn-wishlist ${isWish ? 'active' : ''}" 
                data-wishlist-id="${product.id}"
                onclick="wishlistEngine.toggle('${product.id}')"
                title="${isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}"
              >
                <i class="bi ${isWish ? 'bi-heart-fill' : 'bi-heart'}"></i>
              </button>

              <!-- Hover Quick Action Buttons -->
              <div class="quick-action-overlay">
                <button class="btn-quick-view" onclick="catalogApp.openQuickView('${product.id}')">
                  <i class="bi bi-eye"></i> Quick View
                </button>
                <button class="btn-quick-add" onclick="catalogApp.quickAddPrimary('${product.id}')">
                  <i class="bi bi-bag-plus"></i> Add
                </button>
              </div>
            </div>

            <div class="product-details">
              <span class="product-category-sub">${product.category} • ${product.fit}</span>
              <a href="javascript:void(0)" class="product-title font-editorial" onclick="catalogApp.openQuickView('${product.id}')">
                ${product.name}
              </a>

              <div class="color-dots-group">
                ${product.colors.map(c => `
                  <span class="color-dot" style="background-color: ${c.hex};" title="${c.name}"></span>
                `).join('')}
              </div>

              <div class="product-price-row">
                <span class="product-price">${cartEngine.formatPrice(product.price)}</span>
                ${product.compareAtPrice ? `<span class="compare-price">${cartEngine.formatPrice(product.compareAtPrice)}</span>` : ''}
                <div class="ms-auto small text-muted d-flex align-items-center gap-1">
                  <i class="bi bi-star-fill text-warning" style="font-size: 0.75rem;"></i>
                  <span>${product.rating}</span>
                </div>
              </div>

              <!-- Admin Quick Stock Controls (Visible when admin preview is active) -->
              <div class="admin-stock-bar mt-2 pt-2 border-top d-none">
                <div class="d-flex justify-content-between align-items-center small text-muted">
                  <span>Stock Manager:</span>
                  <button class="btn btn-xs btn-outline-secondary py-0 px-2" style="font-size: 0.65rem;" onclick="catalogApp.openAdminStockModal('${product.id}')">
                    Adjust Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  async quickAddPrimary(productId) {
    const product = await api.getProductById(productId);
    if (!product) return;

    // Pick first available size with stock > 0
    let chosenSize = product.sizes[0];
    if (product.stock) {
      const inStockSize = product.sizes.find(s => product.stock[s] > 0);
      if (inStockSize) chosenSize = inStockSize;
    }

    const chosenColor = product.colors[0];
    await cartEngine.addItem(product, chosenSize, chosenColor, 1);
  }

  async openQuickView(productId) {
    const product = await api.getProductById(productId);
    if (!product) return;

    this.activeQuickProduct = product;
    this.selectedQuickColor = product.colors[0];

    // Pick first size with stock
    this.selectedQuickSize = product.sizes.find(s => (product.stock ? product.stock[s] > 0 : true)) || product.sizes[0];

    // Populate Modal Elements
    document.getElementById('pdp-modal-title').textContent = product.name;
    document.getElementById('pdp-modal-price').textContent = cartEngine.formatPrice(product.price);
    
    const compareEl = document.getElementById('pdp-modal-compare-price');
    if (compareEl) {
      if (product.compareAtPrice) {
        compareEl.textContent = cartEngine.formatPrice(product.compareAtPrice);
        compareEl.classList.remove('d-none');
      } else {
        compareEl.classList.add('d-none');
      }
    }

    document.getElementById('pdp-modal-tagline').textContent = product.tagline;
    document.getElementById('pdp-modal-desc').textContent = product.description;
    document.getElementById('pdp-modal-rating').textContent = `${product.rating} (${product.reviewsCount} reviews)`;

    // Gallery & Thumbnails
    const mainImg = document.getElementById('pdp-main-image');
    mainImg.src = product.image;
    mainImg.alt = product.name;

    const thumbsContainer = document.getElementById('pdp-thumbnails-container');
    if (thumbsContainer) {
      thumbsContainer.innerHTML = product.images.map((img, i) => `
        <img 
          src="${img}" 
          class="rounded border ${i === 0 ? 'border-dark' : 'border-light'}" 
          style="width: 54px; height: 72px; object-fit: cover; cursor: pointer;"
          onclick="document.getElementById('pdp-main-image').src = '${img}'; document.querySelectorAll('#pdp-thumbnails-container img').forEach(t => t.classList.replace('border-dark', 'border-light')); this.classList.replace('border-light', 'border-dark');"
        >
      `).join('');
    }

    // Colors
    const colorsContainer = document.getElementById('pdp-colors-container');
    if (colorsContainer) {
      colorsContainer.innerHTML = product.colors.map((c, i) => `
        <button 
          class="btn p-1 rounded-circle border ${i === 0 ? 'border-dark' : 'border-transparent'}" 
          style="width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;"
          onclick="catalogApp.selectModalColor('${c.name}')"
          title="${c.name}"
        >
          <span style="background-color: ${c.hex}; width: 18px; height: 18px; border-radius: 50%; display: block;"></span>
        </button>
      `).join('');
    }

    // Sizes & Stock
    this.renderModalSizes();

    // Fabric specs & Care
    const specsList = document.getElementById('pdp-materials-list');
    if (specsList) {
      specsList.innerHTML = product.materials.map(m => `<li>${m}</li>`).join('');
    }

    const careList = document.getElementById('pdp-care-list');
    if (careList) {
      careList.innerHTML = product.care.map(c => `<li>${c}</li>`).join('');
    }

    // Wishlist sync in modal
    const wishBtn = document.getElementById('pdp-modal-wishlist-btn');
    if (wishBtn) {
      const isWish = wishlistEngine.isWishlisted(product.id);
      wishBtn.innerHTML = `<i class="bi ${isWish ? 'bi-heart-fill text-danger' : 'bi-heart'} me-2"></i> ${isWish ? 'Saved to Wishlist' : 'Add to Wishlist'}`;
      wishBtn.onclick = () => {
        wishlistEngine.toggle(product.id);
        const nowWish = wishlistEngine.isWishlisted(product.id);
        wishBtn.innerHTML = `<i class="bi ${nowWish ? 'bi-heart-fill text-danger' : 'bi-heart'} me-2"></i> ${nowWish ? 'Saved to Wishlist' : 'Add to Wishlist'}`;
      };
    }

    // Open Modal
    const modalEl = document.getElementById('modalQuickView');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  selectModalColor(colorName) {
    if (!this.activeQuickProduct) return;
    this.selectedQuickColor = this.activeQuickProduct.colors.find(c => c.name === colorName);
    document.getElementById('pdp-selected-color-label').textContent = colorName;
  }

  selectModalSize(size) {
    this.selectedQuickSize = size;
    this.renderModalSizes();
  }

  renderModalSizes() {
    const container = document.getElementById('pdp-sizes-container');
    const stockMsg = document.getElementById('pdp-stock-notice');
    if (!container || !this.activeQuickProduct) return;

    container.innerHTML = this.activeQuickProduct.sizes.map(size => {
      const stock = this.activeQuickProduct.stock ? this.activeQuickProduct.stock[size] : 10;
      const isOut = stock <= 0;
      const isSelected = this.selectedQuickSize === size;

      return `
        <button 
          class="size-pill-btn ${isSelected ? 'active' : ''} ${isOut ? 'disabled' : ''}"
          ${isOut ? 'disabled' : ''}
          onclick="catalogApp.selectModalSize('${size}')"
        >
          ${size}
        </button>
      `;
    }).join('');

    // Stock notice
    if (stockMsg && this.selectedQuickSize) {
      const stock = this.activeQuickProduct.stock ? this.activeQuickProduct.stock[this.selectedQuickSize] : 10;
      if (stock <= 0) {
        stockMsg.innerHTML = `<span class="text-danger"><i class="bi bi-x-circle me-1"></i> Sold out in size ${this.selectedQuickSize}</span>`;
      } else if (stock <= 3) {
        stockMsg.innerHTML = `<span class="text-warning fw-semibold"><i class="bi bi-clock-history me-1"></i> Only ${stock} pieces remaining in size ${this.selectedQuickSize}</span>`;
      } else {
        stockMsg.innerHTML = `<span class="text-success"><i class="bi bi-check2 me-1"></i> In stock, ready to dispatch</span>`;
      }
    }
  }

  async addActiveProductToBag() {
    if (!this.activeQuickProduct) return;

    const qty = parseInt(document.getElementById('pdp-quantity-input')?.value || '1', 10);
    const success = await cartEngine.addItem(
      this.activeQuickProduct,
      this.selectedQuickSize,
      this.selectedQuickColor,
      qty
    );

    if (success) {
      const modalEl = document.getElementById('modalQuickView');
      if (modalEl && window.bootstrap) {
        bootstrap.Modal.getInstance(modalEl).hide();
      }
    }
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.catalogApp = new CatalogApp();
});
