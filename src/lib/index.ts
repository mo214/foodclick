// place files you want to import through the `$lib` alias in this folder.
// src/lib/types.ts

export interface Restaurant {
  id: string;
  name: string;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  restaurant_id: string;
  created_at: string;
}
