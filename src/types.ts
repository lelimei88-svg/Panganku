export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'bumbu' | 'siap-saji' | 'minuman' | 'pokok';
  image: string;
  unit: string;
  isBestSeller?: boolean;
  discountTag?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  clientName: string;
  phoneNumber: string;
  address: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'cod' | 'qris';
  status: 'PENDING' | 'APPROVED' | 'DELIVERED';
  csrfToken: string;
  timestamp: string;
}
