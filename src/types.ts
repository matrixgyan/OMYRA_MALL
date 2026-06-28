export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Creator {
  name: string;
  avatar: string;
  badge?: string;
  salesCount: number;
  rating?: number;
}

export interface Product {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'templates' | 'ebooks' | 'design' | 'code' | 'audio';
  price: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  features: string[];
  filesIncluded: string[];
  fileSize: string;
  coverImage: string; // Background color preset/illustration
  creator: Creator;
  reviews: Review[];
  createdAt: string;
  downloads: number;
  demoUrl?: string;

  // Advanced Product Management Fields
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledPublishDate?: string;
  variants?: { id: string; name: string; price: number; licenseType: string; filesIncluded: string[] }[];
  versions?: { version: string; date: string; changelog: string[] }[];
  licenseType?: 'personal' | 'commercial' | 'resell' | 'mit' | 'proprietary';
  previewVideo?: string;
  gallery?: string[];
  dependencies?: string[];
  minimumRequirements?: { [key: string]: string };
  documentation?: string;
  faqs?: { question: string; answer: string }[];
  discountRules?: { percentage: number; active: boolean };
  flashSale?: { active: boolean; discountPercentage: number; endDate: string; originalPrice: number };
  coupons?: { code: string; discountPercentage: number; active: boolean }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Purchase {
  id: string;
  date: string;
  products: {
    id: string;
    title: string;
    price: number;
    coverImage: string;
    category: string;
    downloadUrl: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
}

export interface CreatorStats {
  views: number;
  sales: number;
  earnings: number;
  conversionRate: number;
}
