export type ProductTrend = "up" | "down" | "stable";
export type Availability = "Available" | "Limited" | "Out Of Stock";

export type MirchiProduct = {
  id: number;
  image: string;
  variety: string;
  grade: string;
  origin: string;
  unit: string;
  wholesalePrice: number;
  retailPrice: number;
  previousPrice: number;
  difference: number;
  trend: ProductTrend;
  availability: Availability;
  updatedTime: string;
  description: string;
  forms: string[];
  highlights: string[];
  specifications: {
    label: string;
    value: string;
  }[];
  uses: string[];
};

export type ProductDetails = {
  productName: string;
  scientificName: string;
  origin: string;
  quality: string;
  grade: string;
  packaging: string;
  shelfLife: string;
  storage: string;
  availableStock: string;
  dispatchTime: string;
  minimumOrder: string;
};

export type MirchiPriceData = {
  lastUpdated: string;
  currency: string;
  market: string;
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  productDetails: ProductDetails;
  products: MirchiProduct[];
  priceHistory: {
    "7days": number[];
    "30days": number[];
    "3months": number[];
  };
};

export type PriceStats = {
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
  availableProducts: number;
  lastUpdated: string;
};

export function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}
