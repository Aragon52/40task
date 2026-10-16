export interface Product {
  id: string;
  title: string;
  image: string;
  type: string;
  price?: number;
  profit?: number;
}

export const PRODUCT_CATALOG: Product[] = [
  {
    "id": "prod-1",
    "title": "RÉNERGIE LIFT MULTI-ACTION ULTRA FACE CREAM WITH SPF 30 1.0 Fl. Oz. (30 mL)",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-1.png",
    "type": "food"
  },
  {
    "id": "prod-2",
    "title": "Apple Watch Series 9 GPS 41mm Smartwatch with Midnight Aluminum Case",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-2.png",
    "type": "electronics"
  },
  {
    "id": "prod-3",
    "title": "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-3.png",
    "type": "electronics"
  },
  {
    "id": "prod-4",
    "title": "Nike Air Max 270 Sneakers Athletic Outdoor Sports Running Shoes",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-4.png",
    "type": "gear"
  },
  {
    "id": "prod-5",
    "title": "Stanley Quencher H2.0 FlowState Tumbler 40oz Vacuum Insulated Mug",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-5.png",
    "type": "gear"
  },
  {
    "id": "prod-6",
    "title": "BLEU DE CHANEL Eau de Parfum Spray for Men 3.4 Fl. Oz.",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-6.png",
    "type": "food"
  },
  {
    "id": "prod-7",
    "title": "L'Oreal Paris Revitalift Pure Hyaluronic Acid Face Serum",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-7.png",
    "type": "food"
  },
  {
    "id": "prod-8",
    "title": "Dyson V8 Absolute Cordless Vacuum Cleaner with HEPA Filtration",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-8.png",
    "type": "electronics"
  },
  {
    "id": "prod-9",
    "title": "Photozyme DNA Repair Enzymes Probiotic P291",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-3.png",
    "type": "gear"
  },
  {
    "id": "prod-10",
    "title": "GrandPad Senior Tablet (Renewed) with Phone",
    "image": "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png",
    "type": "gear"
  }
];
