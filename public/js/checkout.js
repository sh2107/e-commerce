/**
 * ÉLÉVATION ATELIER - CHECKOUT & ORDER FUNNEL
 * Handles multi-step checkout validation, interactive payment preview,
 * order generation, and digital receipt rendering.
 */

class CheckoutManager {
  constructor() {
    this.currentStep = 1;
    this.selectedShippingMethod = 'standard';
    this.init();
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    // Open Checkout Trigger from Cart Drawer
    const proceedBtn = document.getElementById('btn-proceed-checkout');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => this.openCheckout());
    }

    // Step navigation buttons
    const toStep2Btn = document.getElementById('btn-checkout-to-step-2');
    if (toStep2Btn) {
      toStep2Btn.addEventListener('click', () => this.validateAndProceedStep1());
    }

    const backToStep1Btn = document.getElementById('btn-checkout-back-1');
    if (backToStep1Btn) {
      backToStep1Btn.addEventListener('click', () => this.goToStep(1));
    }

    const toStep3Btn = document.getElementById('btn-checkout-to-step-3');
    if (toStep3Btn) {
      toStep3Btn.addEventListener('click', () => this.proceedToPayment());
    }

    const backToStep2Btn = document.getElementById('btn-checkout-back-2');
    if (backToStep2Btn) {
      backToStep2Btn.addEventListener('click', () => this.goToStep(2));
    }

    // Shipping selection change
    const shippingOptions = document.querySelectorAll('input[name="shippingOption"]');
    shippingOptions.forEach(opt => {
      opt.addEventListener('change', (e) => {
        this.selectedShippingMethod = e.target.value;
        this.renderCheckoutSummary();
      });
    });

    // Interactive card input listeners for live credit card visualizer
    const cardNumInput = document.getElementById('card-number');
    const cardHolderInput = document.getElementById('card-holder');
    const cardExpiryInput = document.getElementById('card-expiry');

    if (cardNumInput) {
      cardNumInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val != '' ? val.match(/.{1,4}/g).join(' ') : '•••• •••• •••• ••••';
        const display = document.getElementById('card-visual-number');
        if (display) display.textContent = val;
      });
    }

    if (cardHolderInput) {
      cardHolderInput.addEventListener('input', (e) => {
        const display = document.getElementById('card-visual-name');
        if (display) display.textContent = e.target.value || 'YOUR NAME';
      });
    }

    if (cardExpiryInput) {
      cardExpiryInput.addEventListener('input', (e) => {
        const display = document.getElementById('card-visual-expiry');
        if (display) display.textContent = e.target.value || 'MM/YY';
      });
    }

    // Final Place Order Button
    const placeOrderBtn = document.getElementById('btn-place-order');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => this.processOrder());
    }
  }

  openCheckout() {
    if (cartEngine.cart.length === 0) {
      cartEngine.showToast('Your shopping bag is empty.', 'warning');
      return;
    }

    // Hide cart offcanvas
    const cartDrawerEl = document.getElementById('offcanvasCart');
    if (cartDrawerEl && window.bootstrap) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(cartDrawerEl);
      if (bsOffcanvas) bsOffcanvas.hide();
    }

    this.goToStep(1);
    this.renderCheckoutSummary();

    // Show Checkout Modal
    const modalEl = document.getElementById('modalCheckout');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;

    // Toggle Step Panels
    for (let i = 1; i <= 3; i++) {
      const stepPanel = document.getElementById(`checkout-step-${i}`);
      const indicator = document.getElementById(`step-indicator-${i}`);
      if (stepPanel) {
        if (i === stepNumber) {
          stepPanel.classList.remove('d-none');
        } else {
          stepPanel.classList.add('d-none');
        }
      }
      if (indicator) {
        if (i <= stepNumber) {
          indicator.classList.add('text-dark', 'fw-bold');
          indicator.classList.remove('text-muted');
        } else {
          indicator.classList.remove('text-dark', 'fw-bold');
          indicator.classList.add('text-muted');
        }
      }
    }
  }

  validateAndProceedStep1() {
    const form = document.getElementById('form-checkout-shipping');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    this.goToStep(2);
  }

  proceedToPayment() {
    this.goToStep(3);
  }

  renderCheckoutSummary() {
    const container = document.getElementById('checkout-items-summary');
    if (!container) return;

    const totals = cartEngine.getTotals();
    
    // Adjust for express shipping if selected
    let shippingCost = totals.shipping;
    if (this.selectedShippingMethod === 'express') {
      shippingCost += 15;
    }

    const finalGrandTotal = totals.subtotal - totals.discount + shippingCost;

    container.innerHTML = cartEngine.cart.map(item => `
      <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <img src="${item.image}" alt="${item.name}" style="width: 44px; height: 58px; object-fit: cover; border-radius: 4px;">
          <div>
            <div class="fw-semibold small">${item.name}</div>
            <div class="text-muted small">${item.size} • Qty: ${item.quantity}</div>
          </div>
        </div>
        <div class="fw-bold small">${cartEngine.formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('');

    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const discountEl = document.getElementById('summary-discount');
    const totalEl = document.getElementById('summary-total');

    if (subtotalEl) subtotalEl.textContent = cartEngine.formatPrice(totals.subtotal);
    if (shippingEl) shippingEl.textContent = shippingCost === 0 ? 'FREE' : cartEngine.formatPrice(shippingCost);
    if (totalEl) totalEl.textContent = cartEngine.formatPrice(finalGrandTotal);

    if (discountEl) {
      if (totals.discount > 0) {
        discountEl.parentElement.classList.remove('d-none');
        discountEl.textContent = `-${cartEngine.formatPrice(totals.discount)}`;
      } else {
        discountEl.parentElement.classList.add('d-none');
      }
    }
  }

  async processOrder() {
    const payForm = document.getElementById('form-checkout-payment');
    if (payForm && !payForm.checkValidity()) {
      payForm.reportValidity();
      return;
    }

    const placeBtn = document.getElementById('btn-place-order');
    const originalText = placeBtn.innerHTML;
    placeBtn.disabled = true;
    placeBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Encrypting & Processing...`;

    // Gather checkout details
    const customer = {
      fullName: `${document.getElementById('ship-firstname')?.value || 'Guest'} ${document.getElementById('ship-lastname')?.value || 'Customer'}`,
      email: document.getElementById('ship-email')?.value || 'customer@example.com',
      phone: document.getElementById('ship-phone')?.value || '+1 555-0199',
      address: document.getElementById('ship-address')?.value || '124 Atelier Avenue',
      city: document.getElementById('ship-city')?.value || 'New York',
      postalCode: document.getElementById('ship-postal')?.value || '10001',
      country: document.getElementById('ship-country')?.value || 'United States'
    };

    const totals = cartEngine.getTotals();
    const shippingCost = this.selectedShippingMethod === 'express' ? totals.shipping + 15 : totals.shipping;

    const orderPayload = {
      customer,
      items: [...cartEngine.cart],
      shippingMethod: this.selectedShippingMethod,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: shippingCost,
      total: totals.subtotal - totals.discount + shippingCost,
      paymentMethod: 'Credit Card (Simulated Auth)'
    };

    // Simulate payment transaction network latency
    setTimeout(async () => {
      const res = await api.createOrder(orderPayload);
      placeBtn.disabled = false;
      placeBtn.innerHTML = originalText;

      // Close checkout modal
      const checkoutModalEl = document.getElementById('modalCheckout');
      if (checkoutModalEl && window.bootstrap) {
        bootstrap.Modal.getInstance(checkoutModalEl).hide();
      }

      // Reset cart
      await cartEngine.clearCart();

      // Show receipt modal
      this.showReceipt(res.order);
    }, 1200);
  }

  showReceipt(order) {
    const receiptModalEl = document.getElementById('modalReceipt');
    if (!receiptModalEl) return;

    // Fill Receipt details
    document.getElementById('receipt-order-id').textContent = order.orderNumber;
    document.getElementById('receipt-date').textContent = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    document.getElementById('receipt-customer-name').textContent = order.customer.fullName;
    document.getElementById('receipt-customer-email').textContent = order.customer.email;
    document.getElementById('receipt-customer-address').textContent = `${order.customer.address}, ${order.customer.city} ${order.customer.postalCode}`;
    document.getElementById('receipt-total').textContent = cartEngine.formatPrice(order.total);

    const itemsContainer = document.getElementById('receipt-items-container');
    if (itemsContainer) {
      itemsContainer.innerHTML = order.items.map(item => `
        <div class="d-flex justify-content-between py-2 border-bottom">
          <span>${item.name} (${item.size}) × ${item.quantity}</span>
          <span class="fw-semibold">${cartEngine.formatPrice(item.price * item.quantity)}</span>
        </div>
      `).join('');
    }

    if (window.bootstrap) {
      const receiptModal = bootstrap.Modal.getOrCreateInstance(receiptModalEl);
      receiptModal.show();
    }
  }
}

// Global Checkout Manager instance
const checkoutManager = new CheckoutManager();
