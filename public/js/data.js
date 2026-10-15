/**
 * ÉLÉVATION ATELIER - CURATED CLOTHING CATALOG DATA
 * Decoupled data model ready for SQLite3 migration in Phase 2.
 */

const INITIAL_PRODUCTS = [
  {
    id: "prod-001",
    name: "The Oversized Camel Wool Trench",
    slug: "oversized-camel-wool-trench",
    category: "outerwear",
    gender: "women",
    collection: "atelier-drop",
    price: 380,
    compareAtPrice: 450,
    isNew: true,
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 38,
    image: "/assets/images/hero-coat.jpg",
    images: [
      "/assets/images/hero-coat.jpg",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80"
    ],
    tagline: "Tailored in Florence from 100% virgin double-faced wool.",
    description: "An architectural silhouette featuring dropped shoulders, wide notch lapels, and an adjustable horn-buckle belt. Crafted for timeless layering in cold metropolitan climates.",
    colors: [
      { name: "Camel", hex: "#C19A6B" },
      { name: "Deep Charcoal", hex: "#2B2B2B" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: {
      "XS": 4,
      "S": 8,
      "M": 2, // low stock trigger
      "L": 5,
      "XL": 0 // sold out trigger
    },
    fit: "Oversized",
    materials: ["100% Virgin Wool", "Cupro lining"],
    care: ["Dry clean only", "Do not bleach", "Cool iron if needed"]
  },
  {
    id: "prod-002",
    name: "Double-Breasted Charcoal Wool Blazer",
    slug: "double-breasted-charcoal-wool-blazer",
    category: "outerwear",
    gender: "men",
    collection: "atelier-drop",
    price: 320,
    compareAtPrice: 380,
    isNew: true,
    isBestSeller: false,
    rating: 4.8,
    reviewsCount: 24,
    image: "/assets/images/charcoal-blazer.jpg",
    images: [
      "/assets/images/charcoal-blazer.jpg",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80"
    ],
    tagline: "Sharp tailoring meets relaxed contemporary ease.",
    description: "Constructed with peak lapels, unstructured shoulders, and genuine horn buttons. Woven in Biella, Italy with a fine twill drape that balances formal and evening streetwear.",
    colors: [
      { name: "Charcoal Melange", hex: "#3A3D40" },
      { name: "Midnight Navy", hex: "#1C2430" }
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: {
      "S": 6,
      "M": 7,
      "L": 4,
      "XL": 3
    },
    fit: "Tailored",
    materials: ["98% Wool", "2% Elastane", "Bemberg lining"],
    care: ["Specialist dry clean only", "Steam freshening recommended"]
  },
  {
    id: "prod-003",
    name: "Heritage Cable-Knit Cashmere Sweater",
    slug: "heritage-cable-knit-cashmere-sweater",
    category: "knitwear",
    gender: "unisex",
    collection: "essentials",
    price: 240,
    compareAtPrice: 290,
    isNew: false,
    isBestSeller: true,
    rating: 5.0,
    reviewsCount: 62,
    image: "/assets/images/cashmere-knit.jpg",
    images: [
      "/assets/images/cashmere-knit.jpg",
      "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=80"
    ],
    tagline: "Seven-gauge Scottish cashmere with traditional cable weave.",
    description: "Dense, cloud-soft cashmere spun from Grade-A Mongolian fibers. Ribbed collar and hem with relaxed raglan sleeves designed to last decades without pilling.",
    colors: [
      { name: "Soft Ivory", hex: "#F5F2EB" },
      { name: "Muted Sage", hex: "#8F9779" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: {
      "XS": 3,
      "S": 5,
      "M": 9,
      "L": 2,
      "XL": 4
    },
    fit: "Relaxed",
    materials: ["100% Grade-A Cashmere"],
    care: ["Hand wash in cold water with wool detergent", "Dry flat"]
  },
  {
    id: "prod-004",
    name: "Silk Satin Bias-Cut Slip Dress",
    slug: "silk-satin-bias-cut-slip-dress",
    category: "women",
    gender: "women",
    collection: "atelier-drop",
    price: 210,
    compareAtPrice: null,
    isNew: true,
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 19,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80"
    ],
    tagline: "Fluid 19-momme mulberry silk that caresses natural contours.",
    description: "Cut on the bias for effortless drape. Features delicate adjustable spaghetti straps and a gentle cowl neckline. Ideal for layered evening looks or paired with heavy knits.",
    colors: [
      { name: "Champagne Pearl", hex: "#EADCC9" },
      { name: "Obsidian Black", hex: "#151515" }
    ],
    sizes: ["XS", "S", "M", "L"],
    stock: {
      "XS": 6,
      "S": 4,
      "M": 3,
      "L": 2
    },
    fit: "Tailored",
    materials: ["100% Mulberry Silk (19mm)"],
    care: ["Dry clean or hand wash cold with silk wash", "Iron reverse side on low"]
  },
  {
    id: "prod-005",
    name: "Pleated Wide-Leg Wool Trousers",
    slug: "pleated-wide-leg-wool-trousers",
    category: "men",
    gender: "men",
    collection: "essentials",
    price: 195,
    compareAtPrice: 230,
    isNew: false,
    isBestSeller: true,
    rating: 4.7,
    reviewsCount: 45,
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80"
    ],
    tagline: "High-waisted double front pleats with a fluid wide leg break.",
    description: "Engineered with an internal curtain waistband for all-day comfort. Cut from high-twist tropical wool with exceptional wrinkle resistance and clean break over footwear.",
    colors: [
      { name: "Warm Taupe", hex: "#9E9081" },
      { name: "Jet Black", hex: "#111111" }
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: {
      "S": 8,
      "M": 11,
      "L": 4,
      "XL": 2
    },
    fit: "Relaxed",
    materials: ["100% High-Twist Tropical Wool"],
    care: ["Dry clean only"]
  },
  {
    id: "prod-006",
    name: "Heavyweight Boxy Supima T-Shirt",
    slug: "heavyweight-boxy-supima-t-shirt",
    category: "unisex",
    gender: "unisex",
    collection: "essentials",
    price: 65,
    compareAtPrice: 80,
    isNew: false,
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"
    ],
    tagline: "280 GSM long-staple organic Supima cotton.",
    description: "Preshrunk with a tight dense knit and thick 1-inch ribbed collar. Dropped shoulder cut designed to maintain a clean sculptural drape wash after wash.",
    colors: [
      { name: "Vintage Black", hex: "#222222" },
      { name: "Chalk White", hex: "#F3F3F3" },
      { name: "Washed Olive", hex: "#5C6051" }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    stock: {
      "XS": 12,
      "S": 20,
      "M": 18,
      "L": 15,
      "XL": 9,
      "XXL": 4
    },
    fit: "Oversized",
    materials: ["100% Organic Supima Cotton (280 GSM)"],
    care: ["Machine wash cold with like colors", "Tumble dry low"]
  },
  {
    id: "prod-007",
    name: "Alpaca Blend Ribbed Mockneck",
    slug: "alpaca-blend-ribbed-mockneck",
    category: "knitwear",
    gender: "women",
    collection: "atelier-drop",
    price: 185,
    compareAtPrice: null,
    isNew: true,
    isBestSeller: false,
    rating: 4.8,
    reviewsCount: 14,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80"
    ],
    tagline: "Warm, lightweight Peruvian baby alpaca and merino blend.",
    description: "An airy ribbed knit with a sculptured high mockneck. Naturally thermoregulating and hypoallergenic with an artisanal brushed hand-feel.",
    colors: [
      { name: "Oat Heather", hex: "#D8CEBE" },
      { name: "Forest Moss", hex: "#354230" }
    ],
    sizes: ["XS", "S", "M", "L"],
    stock: {
      "XS": 4,
      "S": 7,
      "M": 5,
      "L": 1
    },
    fit: "Relaxed",
    materials: ["70% Baby Alpaca", "30% Extra-fine Merino Wool"],
    care: ["Hand wash cold", "Do not wring", "Reshape and dry flat"]
  },
  {
    id: "prod-008",
    name: "Full-Grain Italian Leather Atelier Tote",
    slug: "full-grain-italian-leather-tote",
    category: "accessories",
    gender: "unisex",
    collection: "atelier-drop",
    price: 260,
    compareAtPrice: 310,
    isNew: false,
    isBestSeller: true,
    rating: 5.0,
    reviewsCount: 51,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80"
    ],
    tagline: "Vegetable-tanned Tuscan leather with raw suede interior.",
    description: "Engineered to hold a 15-inch laptop, tablet, and daily essentials. Features reinforced hand-stitched rolled handles, an interior magnetic brass key lanyard, and zip pocket.",
    colors: [
      { name: "Cognac Amber", hex: "#8A4A28" },
      { name: "Saddle Black", hex: "#1A1A1A" }
    ],
    sizes: ["One Size"],
    stock: {
      "One Size": 6
    },
    fit: "Regular",
    materials: ["100% Full-Grain Vegetable-Tanned Leather", "Solid Brass Hardware"],
    care: ["Condition with natural leather wax annually"]
  }
];

// Available coupon codes for the promotion engine
const VALID_COUPONS = {
  "ATELIER10": { discountPercent: 10, minSpend: 0, description: "10% off entire order" },
  "VIP20": { discountPercent: 20, minSpend: 200, description: "20% off orders over $200" },
  "FREESHIP": { freeShipping: true, description: "Complimentary express delivery" }
};
