export interface Product {
  id: string;
  title: string;
  image: string;
  type: string;
  price?: number;
  profit?: number;
}

export { PRODUCT_CATALOG } from '../../../admin-portal/src/data/products';
export { 
  TEMPLATE_M_1, 
  TEMPLATE_M_2, 
  TEMPLATE_M_3, 
  TEMPLATE_M_4, 
  TEMPLATE_M_5, 
  TEMPLATE_C_1, 
  TEMPLATE_C_2, 
  TEMPLATE_C_3, 
  TEMPLATE_C_4, 
  TEMPLATE_C_5 
} from '../../../admin-portal/src/pages/OrdersTasking';
