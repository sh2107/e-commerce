/**
 * ÉLÉVATION ATELIER - CART ENGINE
 * Handles cart state, calculation, drawer rendering, and coupon discounts.
 */

class CartEngine {
  constructor() {
    this.cart = [];
    this.activeCoupon = null;
    this.freeShippingThreshold = 150;
    this.shippingRate = 15;
    this.selectedCurrency = 'USD';
    this.currencyRates = {
      USD: { symbol: '$', rate: 1.0 },
      EUR: { symbol: '€', rate: 0.92 },
      GBP: { symbol: '£', rate: 0.79 }
    };

    this.init();
  }

  async init() {
    this.cart = await api.getCart();
    this.updateCartBadge();
    this.renderCartDrawer();
    this.setupListeners();
  }

  setupListeners() {
    // Promo code apply
    const promoBtn = document.getElementById('btn-apply-promo');
    const promoInput = document.getElementById('input-promo-code');
    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => this.applyPromoCode(promoInput.value));
      promoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.applyPromoCode(promoInput.value);
      });
    }

    // Currency selector
    const currencySelect = document.getElementById('currency-selector');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        this.selectedCurrency = e.target.value;
        this.renderCartDrawer();
        if (window.catalogApp) window.catalogApp.renderProducts();
      });
    }
  }

  formatPrice(amountUSD) {
    const { symbol, rate } = this.currencyRates[this.selectedCurrency] || this.currencyRates.USD;
    const converted = (amountUSD * rate).toFixed(2);
    return `${symbol}${converted}`;
  }

  async addItem(product, selectedSize, selectedColor, quantity = 1) {
    if (!selectedSize) {
      this.showToast('Please select a garment size.', 'warning');
      return false;
    }

    const availableStock = product.stock ? product.stock[selectedSize] : 10;
    if (availableStock <= 0) {
      this.showToast(`Size ${selectedSize} is currently out of stock.`, 'danger');
      return false;
    }

    const cartKey = `${product.id}_${selectedSize}_${selectedColor.name}`;
    const existingIndex = this.cart.findIndex(item => item.cartKey === cartKey);

    if (existingIndex > -1) {
      const newQty = this.cart[existingIndex].quantity + quantity;
      if (newQty > availableStock) {
        this.showToast(`Only ${availableStock} pieces available in this size.`, 'warning');
        return false;
      }
      this.cart[existingIndex].quantity = newQty;
    } else {
      this.cart.push({
        cartKey,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        maxStock: availableStock
      });
    }

    await api.saveCart(this.cart);
    this.updateCartBadge();
    this.renderCartDrawer();
    this.showToast(`Added ${product.name} (${selectedSize}) to bag`, 'success');

    // Automatically open cart offcanvas drawer
    const cartDrawerEl = document.getElementById('offcanvasCart');
    if (cartDrawerEl && window.bootstrap) {
      const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(cartDrawerEl);
      bsOffcanvas.show();
    }

    return true;
  }

  async updateQuantity(cartKey, delta) {
    const item = this.cart.find(i => i.cartKey === cartKey);
    if (!item) return;

    const targetQty = item.quantity + delta;
    if (targetQty <= 0) {
      await this.removeItem(cartKey);
      return;
    }

    if (targetQty > item.maxStock) {
      this.showToast(`Maximum stock limit reached for size ${item.size}.`, 'warning');
      return;
    }

    item.quantity = targetQty;
    await api.saveCart(this.cart);
    this.updateCartBadge();
    this.renderCartDrawer();
  }

  async removeItem(cartKey) {
    this.cart = this.cart.filter(i => i.cartKey !== cartKey);
    await api.saveCart(this.cart);
    this.updateCartBadge();
    this.renderCartDrawer();
    this.showToast('Item removed from shopping bag.', 'info');
  }

  async clearCart() {
    this.cart = [];
    this.activeCoupon = null;
    await api.saveCart(this.cart);
    this.updateCartBadge();
    this.renderCartDrawer();
  }

  getTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (this.activeCoupon) {
      if (this.activeCoupon.discountPercent) {
        discount = (subtotal * this.activeCoupon.discountPercent) / 100;
      }
    }

    let shipping = 0;
    if (subtotal > 0) {
      if (this.activeCoupon && this.activeCoupon.freeShipping) {
        shipping = 0;
      } else if (subtotal >= this.freeShippingThreshold) {
        shipping = 0;
      } else {
        shipping = this.shippingRate;
      }
    }

    const total = Math.max(0, subtotal - discount + shipping);

    return {
      subtotal,
      discount,
      shipping,
      total,
      isFreeShipping: shipping === 0 && subtotal > 0
    };
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-badge-count');
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
  }

  renderCartDrawer() {
    const container = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-footer-content');
    const progressFill = document.getElementById('shipping-progress-fill');
    const progressText = document.getElementById('shipping-progress-text');

    if (!container) return;

    const totals = this.getTotals();

    // Update Shipping Progress
    if (progressFill && progressText) {
      const remaining = Math.max(0, this.freeShippingThreshold - totals.subtotal);
      const percentage = Math.min(100, (totals.subtotal / this.freeShippingThreshold) * 100);
      progressFill.style.width = `${percentage}%`;

      if (totals.subtotal === 0) {
        progressText.innerHTML = `Complimentary shipping on orders over <strong>${this.formatPrice(this.freeShippingThreshold)}</strong>`;
      } else if (remaining === 0 || totals.isFreeShipping) {
        progressText.innerHTML = `<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i> You've unlocked Complimentary Express Shipping!</span>`;
      } else {
        progressText.innerHTML = `Add <strong>${this.formatPrice(remaining)}</strong> more for Complimentary Shipping`;
      }
    }

    if (this.cart.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      if (footer) footer.classList.add('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');
    if (footer) footer.classList.remove('d-none');

    // Render items list
    container.innerHTML = this.cart.map(item => `
      <div class="cart-item-row" id="cart-row-${item.cartKey}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start">
            <h6 class="mb-1 font-editorial" style="font-size: 0.95rem;">${item.name}</h6>
            <button class="btn btn-sm text-muted-custom p-0 border-0" onclick="cartEngine.removeItem('${item.cartKey}')" title="Remove">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="d-flex align-items-center gap-2 mb-2 text-muted-custom" style="font-size: 0.78rem;">
            <span>Size: <strong>${item.size}</strong></span>
            <span>•</span>
            <span class="d-flex align-items-center gap-1">
              Color: <span class="color-dot" style="background-color: ${item.color.hex}; width: 10px; height: 10px;"></span>
              <strong>${item.color.name}</strong>
            </span>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="quantity-stepper">
              <button class="quantity-btn" onclick="cartEngine.updateQuantity('${item.cartKey}', -1)">-</button>
              <span class="quantity-val">${item.quantity}</span>
              <button class="quantity-btn" onclick="cartEngine.updateQuantity('${item.cartKey}', 1)">+</button>
            </div>
            <span class="fw-bold" style="font-size: 0.95rem;">${this.formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Update Totals Summary
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountRow = document.getElementById('cart-discount-row');
    const discountEl = document.getElementById('cart-discount-val');
    const shippingEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-grand-total');

    if (subtotalEl) subtotalEl.textContent = this.formatPrice(totals.subtotal);
    if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'FREE' : this.formatPrice(totals.shipping);
    if (totalEl) totalEl.textContent = this.formatPrice(totals.total);

    if (discountRow && discountEl) {
      if (totals.discount > 0) {
        discountRow.classList.remove('d-none');
        discountEl.textContent = `-${this.formatPrice(totals.discount)}`;
      } else {
        discountRow.classList.add('d-none');
      }
    }
  }

  async applyPromoCode(code) {
    const totals = this.getTotals();
    const result = await api.applyCoupon(code, totals.subtotal);
    const feedbackEl = document.getElementById('promo-feedback-msg');

    if (result.success) {
      this.activeCoupon = result.coupon;
      this.renderCartDrawer();
      if (feedbackEl) {
        feedbackEl.className = 'text-success mt-1 small';
        feedbackEl.textContent = result.message;
      }
      this.showToast(result.message, 'success');
    } else {
      if (feedbackEl) {
        feedbackEl.className = 'text-danger mt-1 small';
        feedbackEl.textContent = result.message;
      }
      this.showToast(result.message, 'danger');
    }
  }

  showToast(message, type = 'dark') {
    let toast = document.getElementById('atelier-live-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'atelier-live-toast';
      toast.className = 'atelier-toast';
      document.body.appendChild(toast);
    }

    let icon = 'bi-info-circle';
    if (type === 'success') icon = 'bi-check2-circle text-success';
    if (type === 'danger') icon = 'bi-exclamation-triangle text-danger';
    if (type === 'warning') icon = 'bi-exclamation-circle text-warning';

    toast.innerHTML = `<i class="bi ${icon} fs-5"></i><span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

// Global Cart Engine instance
const cartEngine = new CartEngine();
