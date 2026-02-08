
export interface Product {
  id: string;
  name: string;
  category: 'Hoodie' | 'T-Shirt' | 'Accessories';
  price: number;
  description: string;
  image: string;
  specs: string[];
  features: string[];
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
}

export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  rank: 'Cadet' | 'Pilot' | 'Commander';
  joinedDate: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Pre-flight' | 'In Transit' | 'Delivered';
}
