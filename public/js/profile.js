/**
 * ÉLÉVATION ATELIER - USER PROFILE CONTROLLER
 * Manages customer account details, order history, addresses, payment methods,
 * and bespoke garment sizing preferences.
 */

class UserProfileController {
  constructor() {
    this.profile = null;
    this.orders = [];
    this.activeTab = 'orders';
    this.init();
  }

  async init() {
    this.profile = await api.getUserProfile();
    this.orders = await api.getOrders();
    this.setupListeners();
    this.renderHeaderOverview();
    this.renderTabContent(this.activeTab);
  }

  setupListeners() {
    // Navigation Tabs
    const tabButtons = document.querySelectorAll('.profile-nav-pill');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeTab = e.currentTarget.dataset.tab;
        this.renderTabContent(this.activeTab);
      });
    });

    // Personal Details Form Submission
    const detailsForm = document.getElementById('form-profile-details');
    if (detailsForm) {
      detailsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('prof-fullname').value;
        const email = document.getElementById('prof-email').value;
        const phone = document.getElementById('prof-phone').value;

        const res = await api.updateUserProfile({ fullName, email, phone });
        if (res.success) {
          this.profile = res.profile;
          this.renderHeaderOverview();
          cartEngine.showToast('Profile information successfully updated.', 'success');
        }
      });
    }

    // Sizing Preferences Form Submission
    const sizingForm = document.getElementById('form-profile-sizing');
    if (sizingForm) {
      sizingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const topSize = document.getElementById('pref-top-size').value;
        const bottomSize = document.getElementById('pref-bottom-size').value;
        const shoeSize = document.getElementById('pref-shoe-size').value;
        const preferredFit = document.getElementById('pref-fit-style').value;

        const sizingPreferences = { topSize, bottomSize, shoeSize, preferredFit };
        const res = await api.updateUserProfile({ sizingPreferences });
        if (res.success) {
          this.profile = res.profile;
          cartEngine.showToast('Sizing and silhouette preferences saved.', 'success');
        }
      });
    }

    // Add Address Form Submission
    const addAddrForm = document.getElementById('form-add-address');
    if (addAddrForm) {
      addAddrForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const label = document.getElementById('new-addr-label').value;
        const fullName = document.getElementById('new-addr-name').value;
        const street = document.getElementById('new-addr-street').value;
        const city = document.getElementById('new-addr-city').value;
        const postalCode = document.getElementById('new-addr-postal').value;
        const country = document.getElementById('new-addr-country').value;

        const res = await api.addAddress({ label, fullName, street, city, postalCode, country });
        if (res.success) {
          this.profile = res.profile;
          addAddrForm.reset();
          const modalEl = document.getElementById('modalAddAddress');
          if (modalEl && window.bootstrap) {
            bootstrap.Modal.getInstance(modalEl).hide();
          }
          this.renderAddressesTab();
          cartEngine.showToast('New address saved to your profile.', 'success');
        }
      });
    }
  }

  renderHeaderOverview() {
    if (!this.profile) return;

    // Avatar Monogram
    const initials = this.profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatarEl = document.getElementById('profile-avatar-monogram');
    if (avatarEl) avatarEl.textContent = initials || 'AV';

    // Member Name & Tier
    const nameEl = document.getElementById('profile-user-name');
    if (nameEl) nameEl.textContent = this.profile.fullName;

    const emailEl = document.getElementById('profile-user-email');
    if (emailEl) emailEl.textContent = this.profile.email;

    const tierEl = document.getElementById('profile-user-tier');
    if (tierEl) tierEl.textContent = this.profile.tier;

    // Metrics
    const ordersCountEl = document.getElementById('profile-stat-orders');
    if (ordersCountEl) ordersCountEl.textContent = this.orders.length;

    const wishlistCountEl = document.getElementById('profile-stat-wishlist');
    if (wishlistCountEl) wishlistCountEl.textContent = wishlistEngine.wishlistIds.length;

    const pointsEl = document.getElementById('profile-stat-points');
    if (pointsEl) pointsEl.textContent = this.profile.loyaltyPoints.toLocaleString();

    // Fill details form inputs
    const fnInput = document.getElementById('prof-fullname');
    const emInput = document.getElementById('prof-email');
    const phInput = document.getElementById('prof-phone');
    if (fnInput) fnInput.value = this.profile.fullName;
    if (emInput) emInput.value = this.profile.email;
    if (phInput) phInput.value = this.profile.phone;

    // Fill Sizing Inputs
    if (this.profile.sizingPreferences) {
      const topSelect = document.getElementById('pref-top-size');
      const bottomSelect = document.getElementById('pref-bottom-size');
      const shoeInput = document.getElementById('pref-shoe-size');
      const fitSelect = document.getElementById('pref-fit-style');

      if (topSelect) topSelect.value = this.profile.sizingPreferences.topSize;
      if (bottomSelect) bottomSelect.value = this.profile.sizingPreferences.bottomSize;
      if (shoeInput) shoeInput.value = this.profile.sizingPreferences.shoeSize;
      if (fitSelect) fitSelect.value = this.profile.sizingPreferences.preferredFit;
    }
  }

  renderTabContent(tabName) {
    // Hide all view panes
    document.querySelectorAll('.profile-tab-pane').forEach(p => p.classList.add('d-none'));

    // Show active pane
    const targetPane = document.getElementById(`tab-pane-${tabName}`);
    if (targetPane) targetPane.classList.remove('d-none');

    if (tabName === 'orders') {
      this.renderOrdersTab();
    } else if (tabName === 'addresses') {
      this.renderAddressesTab();
    } else if (tabName === 'cards') {
      this.renderCardsTab();
    }
  }

  renderOrdersTab() {
    const container = document.getElementById('orders-history-list');
    const emptyState = document.getElementById('orders-empty-state');
    if (!container) return;

    if (this.orders.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    container.innerHTML = this.orders.map(order => {
      let badgeClass = 'status-confirmed';
      if (order.status === 'In Transit') badgeClass = 'status-transit';
      if (order.status === 'Delivered') badgeClass = 'status-delivered';

      const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      return `
        <div class="order-card-atelier">
          <div class="order-card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="d-flex align-items-center gap-3">
              <div>
                <span class="small text-muted d-block" style="font-size: 0.72rem;">ORDER PLACED</span>
                <strong class="small">${formattedDate}</strong>
              </div>
              <div>
                <span class="small text-muted d-block" style="font-size: 0.72rem;">TOTAL</span>
                <strong class="small">${cartEngine.formatPrice(order.total)}</strong>
              </div>
              <div class="d-none d-sm-block">
                <span class="small text-muted d-block" style="font-size: 0.72rem;">SHIP TO</span>
                <span class="small">${order.customer?.fullName || 'Alexander Vance'}</span>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge-order-status ${badgeClass}">
                <i class="bi bi-dot"></i> ${order.status}
              </span>
              <span class="font-monospace small text-muted">#${order.orderNumber}</span>
            </div>
          </div>

          <div class="p-3 p-md-4">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div class="d-flex align-items-center gap-3">
                ${order.items.map(item => `
                  <div class="position-relative">
                    <img src="${item.image}" alt="${item.name}" class="order-thumb-mini" title="${item.name} (${item.size})">
                    <span class="position-absolute bottom-0 end-0 badge rounded-pill bg-dark" style="font-size: 0.6rem;">×${item.quantity}</span>
                  </div>
                `).join('')}
                <div>
                  <div class="fw-semibold small">${order.items.map(i => i.name).join(', ')}</div>
                  <div class="text-muted small">${order.items.length} item${order.items.length === 1 ? '' : 's'} • Paid via ${order.paymentMethod || 'Credit Card'}</div>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-atelier-dark py-1 px-3" onclick="userProfileCtrl.openOrderTracker('${order.orderNumber}')">
                  <i class="bi bi-geo-alt me-1"></i> Track Parcel
                </button>
                <button class="btn btn-sm btn-outline-secondary py-1 px-3" onclick="userProfileCtrl.printInvoice('${order.orderNumber}')">
                  <i class="bi bi-receipt me-1"></i> Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderAddressesTab() {
    const container = document.getElementById('addresses-list-container');
    if (!container || !this.profile) return;

    container.innerHTML = this.profile.addresses.map(addr => `
      <div class="col-md-6 mb-3">
        <div class="address-card-box ${addr.isDefault ? 'is-default' : ''}">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0 font-editorial">${addr.label}</h6>
            ${addr.isDefault ? '<span class="badge bg-dark small" style="font-size: 0.65rem;">DEFAULT</span>' : ''}
          </div>
          <p class="small text-muted mb-1 fw-semibold">${addr.fullName}</p>
          <p class="small text-muted mb-2">
            ${addr.street}<br>
            ${addr.city}, ${addr.postalCode}<br>
            ${addr.country}
          </p>
          <div class="d-flex gap-2 mt-auto">
            ${!addr.isDefault ? `
              <button class="btn btn-link p-0 text-dark small" onclick="userProfileCtrl.setDefaultAddress('${addr.id}')">
                Set as Default
              </button>
              <span class="text-muted">•</span>
            ` : ''}
            <button class="btn btn-link p-0 text-danger small" onclick="userProfileCtrl.removeAddress('${addr.id}')">
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderCardsTab() {
    const container = document.getElementById('cards-list-container');
    if (!container || !this.profile) return;

    container.innerHTML = this.profile.savedCards.map(card => `
      <div class="col-md-6 mb-3">
        <div class="payment-card-visual mb-0" style="padding: 1.25rem;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small text-uppercase fw-semibold" style="letter-spacing: 0.1em;">${card.cardType} ATELIER</span>
            <i class="bi bi-credit-card fs-4 text-warning"></i>
          </div>
          <div class="fs-5 fw-bold mb-3 font-monospace">•••• •••• •••• ${card.lastFour}</div>
          <div class="d-flex justify-content-between align-items-end">
            <div>
              <div class="small opacity-50" style="font-size: 0.62rem;">CARDHOLDER</div>
              <div class="small fw-semibold text-uppercase">${card.holder}</div>
            </div>
            <div>
              <div class="small opacity-50" style="font-size: 0.62rem;">EXPIRES</div>
              <div class="small fw-semibold">${card.expiry}</div>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-2 px-1">
          <span class="small text-muted">${card.isDefault ? 'Default Payment Method' : 'Backup Card'}</span>
          <button class="btn btn-link text-danger p-0 small" onclick="userProfileCtrl.removeCard('${card.id}')">
            Remove
          </button>
        </div>
      </div>
    `).join('');
  }

  async setDefaultAddress(addressId) {
    this.profile.addresses.forEach(a => a.isDefault = (a.id === addressId));
    await api.updateUserProfile({ addresses: this.profile.addresses });
    this.renderAddressesTab();
    cartEngine.showToast('Default shipping address updated.', 'success');
  }

  async removeAddress(addressId) {
    const res = await api.deleteAddress(addressId);
    if (res.success) {
      this.profile = res.profile;
      this.renderAddressesTab();
      cartEngine.showToast('Address removed.', 'info');
    }
  }

  async removeCard(cardId) {
    const res = await api.deleteCard(cardId);
    if (res.success) {
      this.profile = res.profile;
      this.renderCardsTab();
      cartEngine.showToast('Card removed from saved payment methods.', 'info');
    }
  }

  openOrderTracker(orderNumber) {
    const order = this.orders.find(o => o.orderNumber === orderNumber);
    if (!order) return;

    document.getElementById('track-order-number').textContent = `#${order.orderNumber}`;
    document.getElementById('track-courier-name').textContent = order.trackingNumber || 'DHL Express Courier';
    document.getElementById('track-dest-address').textContent = `${order.customer?.address || '742 Evergreen Terrace'}, ${order.customer?.city || 'New York'}`;

    const modalEl = document.getElementById('modalOrderTracking');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  printInvoice(orderNumber) {
    const order = this.orders.find(o => o.orderNumber === orderNumber);
    if (!order) return;
    checkoutManager.showReceipt(order);
  }
}

// Global instance initialized on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.userProfileCtrl = new UserProfileController();
});
