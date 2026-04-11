export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string;
  category: string;
  gender?: 'Men' | 'Women' | 'Unisex';
  frameType?: string;
  lensType?: string;
  frameSize?: string;
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  discount?: number;
  discountPercent?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  prescriptionNotes?: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface CreateOrderDto {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  prescriptionNotes?: string;
  isCustomOrder?: boolean;
  frameName?: string;
  rightEyeSphere?: string;
  rightEyeCylinder?: string;
  rightEyeAxis?: string;
  leftEyeSphere?: string;
  leftEyeCylinder?: string;
  leftEyeAxis?: string;
  nearAdd?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}


