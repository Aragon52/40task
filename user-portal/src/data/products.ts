export interface Product {
  id: string;
  title: string;
  image: string;
  type: string;
  price?: number;
  profit?: number;
}

export { PRODUCT_CATALOG } from '../../../admin-portal/src/data/products';
