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
      USER_PROFILE: 'atelier_user_profile',
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
      // Seed a realistic past order for the customer
      const initialOrders = [
        {
          id: "ord-seed-001",
          orderNumber: "ELV-784912",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: "In Transit",
          trackingNumber: "DHL-ATELIER-892144",
          estimatedDelivery: "In 2 days",
          customer: {
            fullName: "Alexander Vance",
            email: "a.vance@atelier-mail.com",
            address: "742 Evergreen Terrace, Apt 4B",
            city: "New York",
            postalCode: "10021",
            country: "United States"
          },
          items: [
            {
              cartKey: "prod-001_M_Camel",
              productId: "prod-001",
              name: "The Oversized Camel Wool Trench",
              price: 380,
              image: "/assets/images/hero-coat.jpg",
              size: "M",
              color: { name: "Camel", hex: "#C19A6B" },
              quantity: 1
            }
          ],
          subtotal: 380,
          discount: 0,
          shipping: 0,
          total: 380,
          paymentMethod: "Visa •••• 4242"
        }
      ];
      localStorage.setItem(this.storageKeys.ORDERS, JSON.stringify(initialOrders));
    }
    if (!localStorage.getItem(this.storageKeys.USER_PROFILE)) {
      const defaultProfile = {
        id: "usr-001",
        fullName: "Alexander Vance",
        email: "a.vance@atelier-mail.com",
        phone: "+1 (555) 019-2834",
        tier: "Atelier Connoisseur",
        tierBadge: "VIP Member",
        memberSince: "October 2024",
        loyaltyPoints: 1450,
        preferredCurrency: "USD",
        sizingPreferences: {
          topSize: "M",
          bottomSize: "32",
          shoeSize: "43 EU",
          preferredFit: "Oversized"
        },
        addresses: [
          {
            id: "addr-001",
            label: "Primary Residence",
            isDefault: true,
            fullName: "Alexander Vance",
            street: "742 Evergreen Terrace, Apt 4B",
            city: "New York",
            postalCode: "10021",
            country: "United States"
          },
          {
            id: "addr-002",
            label: "Paris Atelier Studio",
            isDefault: false,
            fullName: "Alexander Vance",
            street: "18 Rue du Faubourg Saint-Honoré",
            city: "Paris",
            postalCode: "75008",
            country: "France"
          }
        ],
        savedCards: [
          {
            id: "card-001",
            cardType: "Visa",
            lastFour: "4242",
            holder: "ALEXANDER VANCE",
            expiry: "12/28",
            isDefault: true
          }
        ]
      };
      localStorage.setItem(this.storageKeys.USER_PROFILE, JSON.stringify(defaultProfile));
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
   * Fetch all orders (customer order history)
   */
  async getOrders() {
    if (this.useRemoteApi) {
      const res = await fetch('/api/orders');
      return await res.json();
    }
    return JSON.parse(localStorage.getItem(this.storageKeys.ORDERS)) || [];
  }

  /**
   * User Profile Operations
   */
  async getUserProfile() {
    if (this.useRemoteApi) {
      const res = await fetch('/api/user/profile');
      return await res.json();
    }
    return JSON.parse(localStorage.getItem(this.storageKeys.USER_PROFILE));
  }

  async updateUserProfile(updates) {
    if (this.useRemoteApi) {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    }

    let profile = await this.getUserProfile();
    profile = { ...profile, ...updates };
    localStorage.setItem(this.storageKeys.USER_PROFILE, JSON.stringify(profile));
    return { success: true, profile };
  }

  async addAddress(addressData) {
    let profile = await this.getUserProfile();
    const newAddr = {
      id: 'addr-' + Date.now(),
      isDefault: profile.addresses.length === 0,
      ...addressData
    };
    profile.addresses.push(newAddr);
    localStorage.setItem(this.storageKeys.USER_PROFILE, JSON.stringify(profile));
    return { success: true, address: newAddr, profile };
  }

  async deleteAddress(addressId) {
    let profile = await this.getUserProfile();
    profile.addresses = profile.addresses.filter(a => a.id !== addressId);
    localStorage.setItem(this.storageKeys.USER_PROFILE, JSON.stringify(profile));
    return { success: true, profile };
  }

  async saveCard(cardData) {
    let profile = await this.getUserProfile();
    const newCard = {
      id: 'card-' + Date.now(),
      isDefault: profile.savedCards.length === 0,
      ...cardData
    };
    profile.savedCards.push(newCard);
    localStorage.setItem(this.storageKeys.USER_PROFILE, JSON.stringify(profile));
    return { success: true, card: newCard, profile };
  }

  async deleteCard(cardId) {
    let profile = await this.getUserProfile();
    profile.savedCards = profile.savedCards.filter(c => c.id !== cardId);
    localStorage.setItem(this.storageKeys.USER_PROFILE, JSON.stringify(profile));
    return { success: true, profile };
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
