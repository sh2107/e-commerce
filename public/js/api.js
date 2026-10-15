/**
 * ÉLÉVATION ATELIER - DECOUPLED API SERVICE CLIENT
 * Provides a clean interface separating UI from persistence/backend.
 * Switches seamlessly between Local Client Storage and Express + SQLite3 REST endpoints.
 */

class ApiService {
  constructor() {
    this.useRemoteApi = false; // Phase 1: Local Client Mock Engine | Phase 2: Express + SQLite3 API
    this.storageKeys = {
      PRODUCTS: 'atelier_products_catalog',
      CART: 'atelier_cart_items',
      WISHLIST: 'atelier_wishlist_ids',
      ORDERS: 'atelier_customer_orders',
      ACTIVE_COUPON: 'atelier_active_coupon',
      CURRENCY: 'atelier_selected_currency'
    };

    this.initLocalStorage();
  }

  initLocalStorage() {
    if (!localStorage.getItem(this.storageKeys.PRODUCTS)) {
      localStorage.setItem(this.storageKeys.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(this.storageKeys.CART)) {
      localStorage.setItem(this.storageKeys.CART, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.storageKeys.WISHLIST)) {
      localStorage.setItem(this.storageKeys.WISHLIST, JSON.stringify(["prod-001", "prod-003"]));
    }
    if (!localStorage.getItem(this.storageKeys.ORDERS)) {
      localStorage.setItem(this.storageKeys.ORDERS, JSON.stringify([]));
    }
  }

  /**
   * Fetch all products with optional faceted filtering & sorting
   */
  async getProducts(filters = {}) {
    if (this.useRemoteApi) {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/products?${queryParams}`);
      return await res.json();
    }

    // Client-side simulation
    let products = JSON.parse(localStorage.getItem(this.storageKeys.PRODUCTS)) || INITIAL_PRODUCTS;

    // Filter by Category
    if (filters.category && filters.category !== 'all') {
      products = products.filter(p => 
        p.category === filters.category || 
        p.gender === filters.category
      );
    }

    // Filter by Size
    if (filters.size) {
      products = products.filter(p => p.sizes.includes(filters.size));
    }

    // Filter by Max Price
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= Number(filters.maxPrice));
    }

    // Filter by Fit
    if (filters.fit) {
      products = products.filter(p => p.fit === filters.fit);
    }

    // Filter by Search Query
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        default:
          // featured
          break;
      }
    }

    return products;
  }

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    if (this.useRemoteApi) {
      const res = await fetch(`/api/products/${id}`);
      return await res.json();
    }

    const products = JSON.parse(localStorage.getItem(this.storageKeys.PRODUCTS)) || INITIAL_PRODUCTS;
    return products.find(p => p.id === id) || null;
  }

  /**
   * Cart State Operations
   */
  async getCart() {
    return JSON.parse(localStorage.getItem(this.storageKeys.CART)) || [];
  }

  async saveCart(items) {
    localStorage.setItem(this.storageKeys.CART, JSON.stringify(items));
    return items;
  }

  /**
   * Wishlist Operations
   */
  async getWishlist() {
    return JSON.parse(localStorage.getItem(this.storageKeys.WISHLIST)) || [];
  }

  async toggleWishlist(productId) {
    let wishlist = await this.getWishlist();
    const index = wishlist.indexOf(productId);
    let added = false;
    if (index > -1) {
      wishlist.splice(index, 1);
      added = false;
    } else {
      wishlist.push(productId);
      added = true;
    }
    localStorage.setItem(this.storageKeys.WISHLIST, JSON.stringify(wishlist));
    return { wishlist, added };
  }

  /**
   * Coupon Validation
   */
  async applyCoupon(code, subtotal) {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = VALID_COUPONS[normalizedCode];

    if (!coupon) {
      return { success: false, message: "Invalid or expired promotional code." };
    }

    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return { 
        success: false, 
        message: `This coupon requires a minimum subtotal of $${coupon.minSpend}.` 
      };
    }

    return { 
      success: true, 
      coupon: { code: normalizedCode, ...coupon },
      message: `Promotional code applied: ${coupon.description}`
    };
  }

  /**
   * Order Creation & Confirmation
   */
  async createOrder(orderPayload) {
    if (this.useRemoteApi) {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      return await res.json();
    }

    const orders = JSON.parse(localStorage.getItem(this.storageKeys.ORDERS)) || [];
    const generatedOrder = {
      id: 'ord-' + Date.now(),
      orderNumber: 'ELV-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
      ...orderPayload
    };

    orders.unshift(generatedOrder);
    localStorage.setItem(this.storageKeys.ORDERS, JSON.stringify(orders));

    // Clear cart upon successful order
    localStorage.setItem(this.storageKeys.CART, JSON.stringify([]));

    return { success: true, order: generatedOrder };
  }

  /**
   * Admin: Restock / Update inventory simulation
   */
  async updateStock(productId, size, newQty) {
    const products = JSON.parse(localStorage.getItem(this.storageKeys.PRODUCTS)) || INITIAL_PRODUCTS;
    const target = products.find(p => p.id === productId);
    if (target && target.stock) {
      target.stock[size] = Number(newQty);
      localStorage.setItem(this.storageKeys.PRODUCTS, JSON.stringify(products));
      return { success: true, product: target };
    }
    return { success: false, message: "Product or size not found." };
  }
}

// Global API Service instance
const api = new ApiService();
