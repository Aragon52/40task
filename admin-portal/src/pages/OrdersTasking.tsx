import React, { useState, useEffect } from 'react';
import { PRODUCT_CATALOG } from '../data/products';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { 
  ClipboardList, 
  UserPlus, 
  ListOrdered, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Briefcase,
  Layers3,
  Sparkles,
  Award,
  Database,
  Eye,
  Info,
  BadgeAlert,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  ArrowRight,
  UserCheck,
  Search,
  Package,
  Zap,
  Target
} from 'lucide-react';
import { Button, Modal, Card, Input, Badge } from '@/src/shared/UI';

export const TEMPLATE_M_1 = [
  { sr: 1, price: 498.06, profit: 1.1, title: "Dyson V8 Absolute Cordless Vacuum Cleaner with HEPA Filtration", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-8.png" },
  { sr: 2, price: 476.07, profit: 0.8, title: "Apple Watch Series 9 GPS 41mm Smartwatch with Midnight Aluminum Case", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-2.png" },
  { sr: 3, price: 500.1, profit: 1, title: "GrandPad Senior Tablet (Renewed) with Phone", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png" },
  { sr: 4, price: 456.11, profit: 0.77, title: "RÉNERGIE LIFT MULTI-ACTION ULTRA FACE CREAM WITH SPF 30 1.0 Fl. Oz. (30 mL)", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-1.png" },
  { sr: 5, price: 499.12, profit: 0.69, title: "Photozyme DNA Repair Enzymes Probiotic P291", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-3.png" },
  { sr: 6, price: 486.3, profit: 0.74, title: "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-3.png" },
  { sr: 7, price: 501.66, profit: 1.01, title: "1 New ROAD CREW 11L-16 12", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-17.png" },
  { sr: 8, price: 487.12, profit: 0.89, title: "Nike Air Max 270 Sneakers Athletic Outdoor Sports Running Shoes", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-4.png" },
  { sr: 9, price: 491.9, profit: 0.88, title: "BLEU DE CHANEL Eau de Parfum Spray for Men 3.4 Fl. Oz.", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-6.png" },
  { sr: 10, price: 503.65, profit: 1.4, title: "Walker Products 350-64080 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-18.png" },
  { sr: 11, price: 503.44, profit: 0.8, title: "Walker Products 350-34643 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-19.png" },
  { sr: 12, price: 489.87, profit: 0.76, title: "Stanley Quencher H2.0 FlowState Tumbler 40oz Vacuum Insulated Mug", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-5.png" },
  { sr: 13, price: 504, profit: 1.1, title: "Tommy Hilfiger Men’s Oxford Ribb Stripe", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-5.png" },
  { sr: 14, price: 495.65, profit: 0.86, title: "L'Oreal Paris Revitalift Pure Hyaluronic Acid Face Serum", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-7.png" },
  { sr: 15, price: 673.8, profit: 68, title: "AUTOGEN 12V & 24V Jump Starter", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-7.png" },
  { sr: 16, price: 733.8, profit: 1.2, title: "Inteset 12ft 40amp J1772 EV Extension", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-20.png" },
  { sr: 17, price: 731.7, profit: 1, title: "Touch Screen Android Head Unit for", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-14.png" },
  { sr: 18, price: 729.5, profit: 1.43, title: "Scales Of Justice Blue Navy Blue", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-6.png" },
  { sr: 19, price: 721.6, profit: 1.21, title: "Autel Maxisys CV MS908CV", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-8.png" },
  { sr: 20, price: 730.4, profit: 1.2, title: "CARTMAN 3 Pack Warning Triangle DOT", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-12.png" },
  { sr: 21, price: 727.9, profit: 1.1, title: "Garmin DriveSmart 86", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-11.png" },
  { sr: 22, price: 739.3, profit: 1.8, title: "Walker Products 350-34652 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-21.png" },
  { sr: 23, price: 733.9, profit: 1.3, title: "Tyrell Chenergy 1800/900 Peak Amp 12V/24V", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-9.png" },
  { sr: 24, price: 721.4, profit: 1.1, title: "Woeoe Thick Warm Winter Hat Yellow", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-2.png" },
  { sr: 25, price: 734.2, profit: 1.3, title: "ProFormX Velocity 14 Golf Cart Wheels", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-15.png" },
  { sr: 26, price: 740.4, profit: 1.5, title: "NOCO Boost HD GB70 2000 Amp", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-10.png" },
  { sr: 27, price: 749.6, profit: 1.6, title: "Schumacher DSR115 DSR ProSeries Rechargeable Pro", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-13.png" },
  { sr: 28, price: 1036.54, profit: 97, title: "Walker Products 350-64081 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-25.png" },
  { sr: 29, price: 1121.54, profit: 1.7, title: "Women's Sports Mom Embroidered Ladies Fit", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-29.png" },
  { sr: 30, price: 1123.56, profit: 1.6, title: "Ted Baker Alacon Plain Bow Large", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-36.png" },
  { sr: 31, price: 999.78, profit: 1, title: "Rebecca Taylor Women’s Rib Knit Cardi", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-32.png" },
  { sr: 32, price: 1002.4, profit: 1.1, title: "Mob Armor Mob Mount Switch Magnetic", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-16.png" },
  { sr: 33, price: 1123.4, profit: 1.5, title: "Walker Products 350-34095 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-22.png" },
  { sr: 34, price: 1110.5, profit: 1.4, title: "2PCS Car Door Edge Entry Guard", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-27.png" },
  { sr: 35, price: 1123.76, profit: 1.3, title: "Pampers Pure Protection Diapers Size 6", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-33.png" },
  { sr: 36, price: 1137.66, profit: 1.4, title: "Walker Products 350-34639 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-26.png" },
  { sr: 37, price: 1138.99, profit: 1.5, title: "Elfeves Lot 4 PCS Classic Men’s", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-4.png" },
  { sr: 38, price: 1136.86, profit: 1.4, title: "3.1 Phillip Lim Saddle Bag", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-34.png" },
  { sr: 39, price: 1144.79, profit: 1.3, title: "Ted Baker Womens Knot Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-37.png" },
  { sr: 40, price: 1147.74, profit: 1.9, title: "Ted Baker Women Plain Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-38.png" }
];

export const TEMPLATE_M_2 = [
  { sr: 1, price: 1530.4, profit: 2, title: "AUTOGEN 12V & 24V Jump Starter", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-7.png" },
  { sr: 2, price: 1599.5, profit: 1.8, title: "Inteset 12ft 40amp J1772 EV Extension", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-20.png" },
  { sr: 3, price: 1576.4, profit: 2.1, title: "Autel Maxisys CV MS908CV", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-8.png" },
  { sr: 4, price: 1612.3, profit: 1.9, title: "Touch Screen Android Head Unit for", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-14.png" },
  { sr: 5, price: 1588.7, profit: 2.2, title: "Garmin DriveSmart 86", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-11.png" },
  { sr: 6, price: 1630.9, profit: 1.7, title: "CARTMAN 3 Pack Warning Triangle DOT", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-12.png" },
  { sr: 7, price: 1645.6, profit: 2, title: "ProFormX Velocity 14 Golf Cart Wheels", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-15.png" },
  { sr: 8, price: 1621.8, profit: 2.3, title: "Walker Products 350-34652 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-21.png" },
  { sr: 9, price: 1577.4, profit: 1.9, title: "Scales Of Justice Blue Navy Blue", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-6.png" },
  { sr: 10, price: 1689.5, profit: 2.1, title: "NOCO Boost HD GB70 2000 Amp", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-10.png" },
  { sr: 11, price: 1667.3, profit: 2.4, title: "Schumacher DSR115 DSR ProSeries Rechargeable Pro", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-13.png" },
  { sr: 12, price: 1711.2, profit: 2.2, title: "Tyrell Chenergy 1800/900 Peak Amp 12V/24V", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-9.png" },
  { sr: 13, price: 1699.9, profit: 2.5, title: "Woeoe Thick Warm Winter Hat Yellow", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-2.png" },
  { sr: 14, price: 1734.5, profit: 2.1, title: "GrandPad Senior Tablet (Renewed) with Phone", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png" },
  { sr: 15, price: 2212.8, profit: 186.4, title: "Women's Sports Mom Embroidered Ladies Fit", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-29.png" },
  { sr: 16, price: 2345.6, profit: 3.1, title: "Ted Baker Alacon Plain Bow Large", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-36.png" },
  { sr: 17, price: 2412.3, profit: 2.9, title: "Rebecca Taylor Women’s Rib Knit Cardi", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-32.png" },
  { sr: 18, price: 2388.9, profit: 3.2, title: "Mob Armor Mob Mount Switch Magnetic", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-16.png" },
  { sr: 19, price: 2430.5, profit: 3.4, title: "Walker Products 350-34095 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-22.png" },
  { sr: 20, price: 2467.8, profit: 3.1, title: "Pampers Pure Protection Diapers Size 6", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-33.png" },
  { sr: 21, price: 2399.1, profit: 3.3, title: "Walker Products 350-64081 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-25.png" },
  { sr: 22, price: 2488.2, profit: 3.6, title: "2PCS Car Door Edge Entry Guard", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-27.png" },
  { sr: 23, price: 2456.7, profit: 3.2, title: "Elfeves Lot 4 PCS Classic Men’s", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-4.png" },
  { sr: 24, price: 2511.4, profit: 3.5, title: "Ted Baker Womens Knot Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-37.png" },
  { sr: 25, price: 2490.6, profit: 3.8, title: "3.1 Phillip Lim Saddle Bag", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-34.png" },
  { sr: 26, price: 2545.9, profit: 3.4, title: "Walker Products 350-34639 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-26.png" },
  { sr: 27, price: 2533.2, profit: 3.7, title: "Ted Baker Women Plain Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-38.png" },
  { sr: 28, price: 3412.5, profit: 245.8, title: "Proactiv Acne Cleanser - Benzoyl Peroxide", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-45.png" },
  { sr: 29, price: 3567.8, profit: 4.2, title: "ELEMIS Pro-Collagen Marine Cream | Lightweight", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-49.png" },
  { sr: 30, price: 3499.1, profit: 4.5, title: "Farmonics Ubtan Natural Face Wash with", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-46.png" },
  { sr: 31, price: 3620.4, profit: 4.1, title: "BOSS Men’s Authentic Pants", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-50.png" },
  { sr: 32, price: 3588.7, profit: 4.4, title: "NovoGlow No.1 Paris for Women -", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-31.png" },
  { sr: 33, price: 3645.6, profit: 4.8, title: "Lacoste Men’s Sport Fleece Joggernon Deal", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-52.png" },
  { sr: 34, price: 3612.3, profit: 4.3, title: "Gen3 Marine Centric Folding Boat Seat", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-47.png" },
  { sr: 35, price: 3678.9, profit: 4.6, title: "PIOJNYEN 26.5 Lbs Rice Dispenser Large", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-56.png" },
  { sr: 36, price: 3656.4, profit: 4.9, title: "Eyeshadow Palette with Mirror", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-41.png" },
  { sr: 37, price: 3699.7, profit: 4.7, title: "Lacoste Men’s Bold Graphic Jogger Sweatpant", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-61.png" },
  { sr: 38, price: 3688.2, profit: 5.1, title: "Rebecca Taylor Women’s Long Sleeve Animal", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-137.png" },
  { sr: 39, price: 3712.5, profit: 4.8, title: "Byinns Womens Square Neck Sleeveless Ruffle", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-136.png" },
  { sr: 40, price: 3745.6, profit: 5.4, title: "Rebecca Taylor Women’s Violet Fleur Belted", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-148.png" }
];

export const TEMPLATE_M_3 = [
  { sr: 1, price: 5412.3, profit: 6.5, title: "Rebecca Taylor Women’s Marseille Stripe Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-143.png" },
  { sr: 2, price: 5567.8, profit: 6.2, title: "PAIGE Women’s Cindy Maternity Jeans", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-58.png" },
  { sr: 3, price: 5499.1, profit: 6.8, title: "Adrianna Papell Women’s Metallic Jacquard Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-130.png" },
  { sr: 4, price: 5620.4, profit: 6.4, title: "Rebecca Taylor Women’s Short Sleeve Dot", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-138.png" },
  { sr: 5, price: 5588.7, profit: 7.1, title: "siliteelon Women High Waist Casual Wide", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-158.png" },
  { sr: 6, price: 5645.6, profit: 6.7, title: "45W USB C Super Fast Charger", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-169.png" },
  { sr: 7, price: 5612.3, profit: 7.3, title: "Rebecca Taylor Women’s Long Sleeve V-Neck", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-157.png" },
  { sr: 8, price: 5678.9, profit: 6.9, title: "ACR ResQLink View - Buoyant Personal", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-170.png" },
  { sr: 9, price: 5656.4, profit: 7.6, title: "Google Pixel 6 Pro - 5G", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-175.png" },
  { sr: 10, price: 5699.7, profit: 7.2, title: "VEVOR Retractable Extension Cord Reel 65", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-171.png" },
  { sr: 11, price: 5688.2, profit: 7.9, title: "NUTSAAKK Yoga Mat Holder Wall Mount", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-181.png" },
  { sr: 12, price: 5712.5, profit: 7.5, title: "PRUKIVRA Non Slip Yoga Towel with", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-188.png" },
  { sr: 13, price: 5745.6, profit: 8.2, title: "Crostice Bike Mat Compatible with Peloton", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-189.png" },
  { sr: 14, price: 5733.2, profit: 7.8, title: "Huffy Stone Mountain Bike", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-193.png" },
  { sr: 15, price: 7412.5, profit: 689.4, title: "KHADLAJ PERFUMES Hareem Al Sultan Concentrated", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-205.png" },
  { sr: 16, price: 7567.8, profit: 8.5, title: "Marc Jacobs Daisy Dream Eau de", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-209.png" },
  { sr: 17, price: 7499.1, profit: 9.2, title: "Christian Dior Jadore By Christian Dior", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-201.png" },
  { sr: 18, price: 7620.4, profit: 8.8, title: "Givenchy L’interdit Women", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-204.png" },
  { sr: 19, price: 7588.7, profit: 9.5, title: "GIORGIO ARMANI - Armani Code Eau", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-203.png" },
  { sr: 20, price: 7645.6, profit: 9.1, title: "CHRISTIAN DIOR J’Adore Women Eau De", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-206.png" },
  { sr: 21, price: 7612.3, profit: 9.8, title: "Sukeen Cooling Towel for Neck and", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-190.png" },
  { sr: 22, price: 7678.9, profit: 9.4, title: "Mongoose Fireball Dirt Jump Mens and", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-195.png" },
  { sr: 23, price: 7656.4, profit: 10.1, title: "Dolce & Gabbana The Only One", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-202.png" },
  { sr: 24, price: 7699.7, profit: 9.7, title: "Schwinn Bonafide Men and Women Mountain", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-194.png" },
  { sr: 25, price: 7688.2, profit: 10.4, title: "Lattafa Perfumes Asad for Unisex Eau", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-210.png" },
  { sr: 26, price: 7712.5, profit: 10, title: "Powder Canister", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-42.png" },
  { sr: 27, price: 7745.6, profit: 10.7, title: "Lacoste Men’s Sport Tennis Shorts", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-51.png" },
  { sr: 28, price: 10412.5, profit: 897.6, title: "PAIGE Women’s Allure Short Raw Hem", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-59.png" },
  { sr: 29, price: 11567.8, profit: 12.5, title: "TrumKiFier RC Boat for Kids", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-48.png" },
  { sr: 30, price: 11499.1, profit: 13.2, title: "Red Nail Polish", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-44.png" },
  { sr: 31, price: 11620.4, profit: 12.8, title: "Red Lipstick", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-43.png" },
  { sr: 32, price: 11588.7, profit: 13.5, title: "Rebecca Taylor Women’s Smocked Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-139.png" },
  { sr: 33, price: 11645.6, profit: 13.1, title: "PAIGE womens Carly Jumpsuit Short Sleeve", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-132.png" },
  { sr: 34, price: 11612.3, profit: 13.8, title: "Rebecca Taylor Women’s Labyrinth Slip Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-146.png" },
  { sr: 35, price: 11678.9, profit: 13.4, title: "Mizuno Prospect Softball Pant", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-57.png" },
  { sr: 36, price: 11656.4, profit: 14.1, title: "Janasya Women’s Mustard Foil Printed Poly", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-128.png" },
  { sr: 37, price: 11699.7, profit: 13.7, title: "Lacoste Men’s Slim Fit Stretch Denim", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-53.png" },
  { sr: 38, price: 11688.2, profit: 14.4, title: "Lacoste Women’s Short Sleeve Slim Fit", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-142.png" },
  { sr: 39, price: 11712.5, profit: 14, title: "Lacoste Mens Sport Tennis Fleece Short", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-60.png" },
  { sr: 40, price: 11745.6, profit: 14.7, title: "Adrianna Papell Stretch Crepe Jumpsuit with", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-131.png" }
];

export const TEMPLATE_M_4 = [
  { sr: 1, price: 7412.5, profit: 8.5, title: "Rebecca Taylor womens Check Romper", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-155.png" },
  { sr: 2, price: 7567.8, profit: 8.2, title: "Rebecca Taylor Women’s Agnes Embroidery Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-152.png" },
  { sr: 3, price: 7499.1, profit: 8.8, title: "YUAKOU Women’s Tulle Petticoat Crinoline Half", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-154.png" },
  { sr: 4, price: 7620.4, profit: 8.4, title: "Rebecca Taylor Women’s Godet Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-159.png" },
  { sr: 5, price: 7588.7, profit: 9.1, title: "Adrianna Papell Women’s Metallic Knit Draped", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-166.png" },
  { sr: 6, price: 7645.6, profit: 8.7, title: "MSemis Woman Sexy Mesh Sheer Transparent", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-153.png" },
  { sr: 7, price: 7612.3, profit: 9.3, title: "Rebecca Taylor Women’s Sleeveless V-Neck Tweed", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-168.png" },
  { sr: 8, price: 7678.9, profit: 8.9, title: "Rebecca Taylor Women’s Daphne Fleur Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-151.png" },
  { sr: 9, price: 7656.4, profit: 9.6, title: "Adrianna Papell Women’s Beaded Short Cocktail", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-167.png" },
  { sr: 10, price: 7699.7, profit: 9.2, title: "Rebecca Taylor Women’s Long Sleeve Star", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-164.png" },
  { sr: 11, price: 7688.2, profit: 9.9, title: "Lenovo Tab P11 (2nd Gen) -", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-173.png" },
  { sr: 12, price: 7712.5, profit: 9.5, title: "Rebecca Taylor Women’s Long Sleeve Perla", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-163.png" },
  { sr: 13, price: 7745.6, profit: 10.2, title: "Alex Evenings Women’s A-line Lace Evening", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-129.png" },
  { sr: 14, price: 7733.2, profit: 9.8, title: "Byinns Womens Square Neck Sleeveless Ruffle", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-136.png" },
  { sr: 15, price: 10412.5, profit: 1125.6, title: "Alex Evenings Women’s Long Mock Jacket Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-141.png" },
  { sr: 16, price: 11567.8, profit: 13.5, title: "Ted Baker Alacon Plain Bow Large", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-36.png" },
  { sr: 17, price: 11499.1, profit: 14.2, title: "Rebecca Taylor Women’s Rib Knit Cardi", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-32.png" },
  { sr: 18, price: 11620.4, profit: 13.8, title: "Mob Armor Mob Mount Switch Magnetic", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-16.png" },
  { sr: 19, price: 11588.7, profit: 14.5, title: "Walker Products 350-34095 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-22.png" },
  { sr: 20, price: 11645.6, profit: 14.1, title: "Pampers Pure Protection Diapers Size 6", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-33.png" },
  { sr: 21, price: 11612.3, profit: 14.8, title: "Walker Products 350-64081 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-25.png" },
  { sr: 22, price: 11678.9, profit: 14.4, title: "2PCS Car Door Edge Entry Guard", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-27.png" },
  { sr: 23, price: 11656.4, profit: 15.1, title: "Elfeves Lot 4 PCS Classic Men’s", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-4.png" },
  { sr: 24, price: 11699.7, profit: 14.7, title: "Ted Baker Womens Knot Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-37.png" },
  { sr: 25, price: 11688.2, profit: 15.4, title: "3.1 Phillip Lim Saddle Bag", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-34.png" },
  { sr: 26, price: 11712.5, profit: 15, title: "Walker Products 350-34639 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-26.png" },
  { sr: 27, price: 11745.6, profit: 15.7, title: "Ted Baker Women Plain Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-38.png" },
  { sr: 28, price: 21412.5, profit: 2456.8, title: "Christian Dior Jadore By Christian Dior", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-201.png" },
  { sr: 29, price: 22567.8, profit: 26.5, title: "Givenchy L’interdit Women", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-204.png" },
  { sr: 30, price: 22499.1, profit: 27.2, title: "GIORGIO ARMANI - Armani Code Eau", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-203.png" },
  { sr: 31, price: 22620.4, profit: 26.8, title: "CHRISTIAN DIOR J’Adore Women Eau De", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-206.png" },
  { sr: 32, price: 22588.7, profit: 27.5, title: "Sukeen Cooling Towel for Neck and", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-190.png" },
  { sr: 33, price: 22645.6, profit: 27.1, title: "Mongoose Fireball Dirt Jump Mens and", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-195.png" },
  { sr: 34, price: 22612.3, profit: 27.8, title: "Dolce & Gabbana The Only One", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-202.png" },
  { sr: 35, price: 22678.9, profit: 27.4, title: "Schwinn Bonafide Men and Women Mountain", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-194.png" },
  { sr: 36, price: 22656.4, profit: 28.1, title: "Lattafa Perfumes Asad for Unisex Eau", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-210.png" },
  { sr: 37, price: 22699.7, profit: 27.7, title: "Powder Canister", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-42.png" },
  { sr: 38, price: 22688.2, profit: 28.4, title: "Lacoste Men’s Sport Tennis Shorts", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-51.png" },
  { sr: 39, price: 22712.5, profit: 28, title: "PAIGE Women’s Allure Short Raw Hem", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-59.png" },
  { sr: 40, price: 22745.6, profit: 28.7, title: "TrumKiFier RC Boat for Kids", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-48.png" }
];

export const TEMPLATE_M_5 = [
  { sr: 1, price: 9412.5, profit: 10.5, title: "Rebecca Taylor womens Check Romper", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-155.png" },
  { sr: 2, price: 9567.8, profit: 10.2, title: "Rebecca Taylor Women’s Agnes Embroidery Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-152.png" },
  { sr: 3, price: 9499.1, profit: 10.8, title: "YUAKOU Women’s Tulle Petticoat Crinoline Half", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-154.png" },
  { sr: 4, price: 9620.4, profit: 10.4, title: "Rebecca Taylor Women’s Godet Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-159.png" },
  { sr: 5, price: 9588.7, profit: 11.1, title: "Adrianna Papell Women’s Metallic Knit Draped", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-166.png" },
  { sr: 6, price: 9645.6, profit: 10.7, title: "MSemis Woman Sexy Mesh Sheer Transparent", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-153.png" },
  { sr: 7, price: 9612.3, profit: 11.3, title: "Rebecca Taylor Women’s Sleeveless V-Neck Tweed", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-168.png" },
  { sr: 8, price: 9678.9, profit: 10.9, title: "Rebecca Taylor Women’s Daphne Fleur Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-151.png" },
  { sr: 9, price: 9656.4, profit: 11.6, title: "Adrianna Papell Women’s Beaded Short Cocktail", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-167.png" },
  { sr: 10, price: 9699.7, profit: 11.2, title: "Rebecca Taylor Women’s Long Sleeve Star", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-164.png" },
  { sr: 11, price: 9688.2, profit: 11.9, title: "Lenovo Tab P11 (2nd Gen) -", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-173.png" },
  { sr: 12, price: 9712.5, profit: 11.5, title: "Rebecca Taylor Women’s Long Sleeve Perla", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-163.png" },
  { sr: 13, price: 9745.6, profit: 12.2, title: "Alex Evenings Women’s A-line Lace Evening", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-129.png" },
  { sr: 14, price: 9733.2, profit: 11.8, title: "Byinns Womens Square Neck Sleeveless Ruffle", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-136.png" },
  { sr: 15, price: 12412.5, profit: 1225.6, title: "Alex Evenings Women’s Long Mock Jacket Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-141.png" },
  { sr: 16, price: 13567.8, profit: 15.5, title: "Ted Baker Alacon Plain Bow Large", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-36.png" },
  { sr: 17, price: 13499.1, profit: 16.2, title: "Rebecca Taylor Women’s Rib Knit Cardi", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-32.png" },
  { sr: 18, price: 13620.4, profit: 15.8, title: "Mob Armor Mob Mount Switch Magnetic", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-16.png" },
  { sr: 19, price: 13588.7, profit: 16.5, title: "Walker Products 350-34095 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-22.png" },
  { sr: 20, price: 13645.6, profit: 16.1, title: "Pampers Pure Protection Diapers Size 6", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-33.png" },
  { sr: 21, price: 13612.3, profit: 16.8, title: "Walker Products 350-64081 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-25.png" },
  { sr: 22, price: 13678.9, profit: 16.4, title: "2PCS Car Door Edge Entry Guard", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-27.png" },
  { sr: 23, price: 13656.4, profit: 17.1, title: "Elfeves Lot 4 PCS Classic Men’s", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-4.png" },
  { sr: 24, price: 13699.7, profit: 16.7, title: "Ted Baker Womens Knot Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-37.png" },
  { sr: 25, price: 13688.2, profit: 17.4, title: "3.1 Phillip Lim Saddle Bag", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-34.png" },
  { sr: 26, price: 13712.5, profit: 17, title: "Walker Products 350-34639 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-26.png" },
  { sr: 27, price: 13745.6, profit: 17.7, title: "Ted Baker Women Plain Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-38.png" },
  { sr: 28, price: 23412.5, profit: 2656.8, title: "Christian Dior Jadore By Christian Dior", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-201.png" },
  { sr: 29, price: 24567.8, profit: 28.5, title: "Givenchy L’interdit Women", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-204.png" },
  { sr: 30, price: 24499.1, profit: 29.2, title: "GIORGIO ARMANI - Armani Code Eau", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-203.png" },
  { sr: 31, price: 24620.4, profit: 28.8, title: "CHRISTIAN DIOR J’Adore Women Eau De", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-206.png" },
  { sr: 32, price: 24588.7, profit: 29.5, title: "Sukeen Cooling Towel for Neck and", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-190.png" },
  { sr: 33, price: 24645.6, profit: 29.1, title: "Mongoose Fireball Dirt Jump Mens and", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-195.png" },
  { sr: 34, price: 24612.3, profit: 29.8, title: "Dolce & Gabbana The Only One", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-202.png" },
  { sr: 35, price: 24678.9, profit: 29.4, title: "Schwinn Bonafide Men and Women Mountain", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-194.png" },
  { sr: 36, price: 24656.4, profit: 30.1, title: "Lattafa Perfumes Asad for Unisex Eau", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-210.png" },
  { sr: 37, price: 24699.7, profit: 29.7, title: "Powder Canister", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-42.png" },
  { sr: 38, price: 24688.2, profit: 30.4, title: "Lacoste Men’s Sport Tennis Shorts", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-51.png" },
  { sr: 39, price: 24712.5, profit: 30, title: "PAIGE Women’s Allure Short Raw Hem", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-59.png" },
  { sr: 40, price: 24745.6, profit: 30.7, title: "TrumKiFier RC Boat for Kids", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-48.png" }
];

export const TEMPLATE_C_1 = [
  { sr: 1, price: 21.01, profit: 0.07, title: "1 New ROAD CREW 11L-16 12", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-17.png" },
  { sr: 2, price: 20.12, profit: 0.06, title: "Stanley Quencher H2.0 FlowState Tumbler 40oz Vacuum Insulated Mug", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-5.png" },
  { sr: 3, price: 19.45, profit: 0.04, title: "Apple Watch Series 9 GPS 41mm Smartwatch with Midnight Aluminum Case", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-2.png" },
  { sr: 4, price: 20.11, profit: 0.07, title: "Nike Air Max 270 Sneakers Athletic Outdoor Sports Running Shoes", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-4.png" },
  { sr: 5, price: 20.43, profit: 0.06, title: "BLEU DE CHANEL Eau de Parfum Spray for Men 3.4 Fl. Oz.", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-6.png" },
  { sr: 6, price: 20.56, profit: 0.05, title: "L'Oreal Paris Revitalift Pure Hyaluronic Acid Face Serum", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-7.png" },
  { sr: 7, price: 20.88, profit: 0.08, title: "Photozyme DNA Repair Enzymes Probiotic P291", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-3.png" },
  { sr: 8, price: 20.94, profit: 0.07, title: "GrandPad Senior Tablet (Renewed) with Phone", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png" },
  { sr: 9, price: 21.12, profit: 0.08, title: "Walker Products 350-64080 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-18.png" },
  { sr: 10, price: 19.88, profit: 0.06, title: "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-3.png" },
  { sr: 11, price: 18.98, profit: 0.05, title: "RÉNERGIE LIFT MULTI-ACTION ULTRA FACE CREAM WITH SPF 30 1.0 Fl. Oz. (30 mL)", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-1.png" },
  { sr: 12, price: 20.77, profit: 0.09, title: "Dyson V8 Absolute Cordless Vacuum Cleaner with HEPA Filtration", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-8.png" },
  { sr: 13, price: 19.45, profit: 0.08, title: "Apple Watch Series 9 GPS 41mm Smartwatch with Midnight Aluminum Case", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-2.png" },
  { sr: 14, price: 20.77, profit: 0.07, title: "Dyson V8 Absolute Cordless Vacuum Cleaner with HEPA Filtration", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-8.png" },
  { sr: 15, price: 21.21, profit: 0.07, title: "Tommy Hilfiger Men’s Oxford Ribb Stripe", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-5.png" },
  { sr: 16, price: 21.11, profit: 0.06, title: "Walker Products 350-34643 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-19.png" },
  { sr: 17, price: 20.56, profit: 0.05, title: "L'Oreal Paris Revitalift Pure Hyaluronic Acid Face Serum", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-7.png" },
  { sr: 18, price: 20.88, profit: 0.08, title: "Photozyme DNA Repair Enzymes Probiotic P291", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-3.png" },
  { sr: 19, price: 20.94, profit: 0.07, title: "GrandPad Senior Tablet (Renewed) with Phone", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png" },
  { sr: 20, price: 21.12, profit: 0.08, title: "Walker Products 350-64080 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-18.png" },
  { sr: 21, price: 19.88, profit: 0.06, title: "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-3.png" },
  { sr: 22, price: 19.88, profit: 0.06, title: "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-3.png" },
  { sr: 23, price: 18.98, profit: 0.05, title: "RÉNERGIE LIFT MULTI-ACTION ULTRA FACE CREAM WITH SPF 30 1.0 Fl. Oz. (30 mL)", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-1.png" },
  { sr: 24, price: 20.77, profit: 0.09, title: "Dyson V8 Absolute Cordless Vacuum Cleaner with HEPA Filtration", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-8.png" },
  { sr: 25, price: 19.45, profit: 0.08, title: "Apple Watch Series 9 GPS 41mm Smartwatch with Midnight Aluminum Case", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-2.png" },
  { sr: 26, price: 20.77, profit: 0.07, title: "Dyson V8 Absolute Cordless Vacuum Cleaner with HEPA Filtration", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-8.png" },
  { sr: 27, price: 21.21, profit: 0.07, title: "Tommy Hilfiger Men’s Oxford Ribb Stripe", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-5.png" },
  { sr: 28, price: 21.11, profit: 0.06, title: "Walker Products 350-34643 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-19.png" },
  { sr: 29, price: 20.56, profit: 0.05, title: "L'Oreal Paris Revitalift Pure Hyaluronic Acid Face Serum", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-7.png" },
  { sr: 30, price: 20.88, profit: 0.08, title: "Photozyme DNA Repair Enzymes Probiotic P291", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-3.png" },
  { sr: 31, price: 20.94, profit: 0.07, title: "GrandPad Senior Tablet (Renewed) with Phone", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png" },
  { sr: 32, price: 21.12, profit: 0.08, title: "Walker Products 350-64080 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-18.png" },
  { sr: 33, price: 19.88, profit: 0.06, title: "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-3.png" },
  { sr: 34, price: 19.88, profit: 0.06, title: "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-3.png" },
  { sr: 35, price: 18.98, profit: 0.05, title: "RÉNERGIE LIFT MULTI-ACTION ULTRA FACE CREAM WITH SPF 30 1.0 Fl. Oz. (30 mL)", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-1.png" },
  { sr: 36, price: 20.77, profit: 0.09, title: "Dyson V8 Absolute Cordless Vacuum Cleaner with HEPA Filtration", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-8.png" },
  { sr: 37, price: 20.94, profit: 0.07, title: "GrandPad Senior Tablet (Renewed) with Phone", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-1.png" },
  { sr: 38, price: 21.12, profit: 0.08, title: "Walker Products 350-64080 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-18.png" },
  { sr: 39, price: 19.88, profit: 0.06, title: "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-3.png" },
  { sr: 40, price: 19.88, profit: 0.06, title: "Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/prod-3.png" }
];

export const TEMPLATE_C_2 = [
  { sr: 1, price: 40.2, profit: 0.12, title: "AUTOGEN 12V & 24V Jump Starter", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-7.png" },
  { sr: 2, price: 43.8, profit: 0.11, title: "Woeoe Thick Warm Winter Hat Yellow", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-2.png" },
  { sr: 3, price: 46.8, profit: 0.15, title: "Garmin DriveSmart 86", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-11.png" },
  { sr: 4, price: 43.8, profit: 0.11, title: "Woeoe Thick Warm Winter Hat Yellow", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-2.png" },
  { sr: 5, price: 47.8, profit: 0.14, title: "Scales Of Justice Blue Navy Blue", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-6.png" },
  { sr: 6, price: 40.2, profit: 0.27, title: "AUTOGEN 12V & 24V Jump Starter", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-7.png" },
  { sr: 7, price: 43.8, profit: 0.11, title: "Woeoe Thick Warm Winter Hat Yellow", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-2.png" },
  { sr: 8, price: 47.8, profit: 0.28, title: "Scales Of Justice Blue Navy Blue", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-6.png" },
  { sr: 9, price: 43.8, profit: 0.11, title: "Woeoe Thick Warm Winter Hat Yellow", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-2.png" },
  { sr: 10, price: 46.8, profit: 0.15, title: "Garmin DriveSmart 86", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-11.png" },
  { sr: 11, price: 47.8, profit: 0.14, title: "Scales Of Justice Blue Navy Blue", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-6.png" },
  { sr: 12, price: 43.8, profit: 0.11, title: "Woeoe Thick Warm Winter Hat Yellow", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-2.png" },
  { sr: 13, price: 45.9, profit: 0.14, title: "Autel Maxisys CV MS908CV", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-8.png" },
  { sr: 14, price: 43.8, profit: 0.11, title: "Woeoe Thick Warm Winter Hat Yellow", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-2.png" },
  { sr: 15, price: 47.8, profit: 0.14, title: "Scales Of Justice Blue Navy Blue", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-6.png" },
  { sr: 16, price: 81.87, profit: 14, title: "CARTMAN 3 Pack Warning Triangle DOT", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-12.png" },
  { sr: 17, price: 94.11, profit: 0.23, title: "Walker Products 350-34652 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-21.png" },
  { sr: 18, price: 93.24, profit: 0.22, title: "ProFormX Velocity 14 Golf Cart Wheels", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-15.png" },
  { sr: 19, price: 91.88, profit: 0.2, title: "Touch Screen Android Head Unit for", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-14.png" },
  { sr: 20, price: 94.99, profit: 0.3, title: "NOCO Boost HD GB70 2000 Amp", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-10.png" },
  { sr: 21, price: 91.96, profit: 0.19, title: "Inteset 12ft 40amp J1772 EV Extension", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-20.png" },
  { sr: 22, price: 91.88, profit: 0.2, title: "Touch Screen Android Head Unit for", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-14.png" },
  { sr: 23, price: 94.99, profit: 0.3, title: "NOCO Boost HD GB70 2000 Amp", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-10.png" },
  { sr: 24, price: 92.66, profit: 0.19, title: "Tyrell Chenergy 1800/900 Peak Amp 12V/24V", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-9.png" },
  { sr: 25, price: 94.11, profit: 0.23, title: "Walker Products 350-34652 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-21.png" },
  { sr: 26, price: 93.24, profit: 0.22, title: "ProFormX Velocity 14 Golf Cart Wheels", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-15.png" },
  { sr: 27, price: 91.88, profit: 0.2, title: "Touch Screen Android Head Unit for", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-14.png" },
  { sr: 28, price: 94.99, profit: 0.3, title: "NOCO Boost HD GB70 2000 Amp", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-10.png" },
  { sr: 29, price: 97.01, profit: 0.34, title: "Schumacher DSR115 DSR ProSeries Rechargeable Pro", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-13.png" },
  { sr: 30, price: 161.99, profit: 26, title: "Rebecca Taylor Women’s Rib Knit Cardi", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-32.png" },
  { sr: 31, price: 180.55, profit: 0.5, title: "Women's Sports Mom Embroidered Ladies Fit", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-29.png" },
  { sr: 32, price: 187.01, profit: 0.6, title: "Pampers Pure Protection Diapers Size 6", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-33.png" },
  { sr: 33, price: 164.88, profit: 0.4, title: "Mob Armor Mob Mount Switch Magnetic", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-16.png" },
  { sr: 34, price: 183.99, profit: 0.4, title: "Walker Products 350-34095 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-22.png" },
  { sr: 35, price: 186.96, profit: 0.4, title: "Ted Baker Alacon Plain Bow Large", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-36.png" },
  { sr: 36, price: 171.8, profit: 0.3, title: "Walker Products 350-64081 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-25.png" },
  { sr: 37, price: 177.9, profit: 0.3, title: "2PCS Car Door Edge Entry Guard", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-27.png" },
  { sr: 38, price: 180.55, profit: 0.5, title: "Women's Sports Mom Embroidered Ladies Fit", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-29.png" },
  { sr: 39, price: 187.01, profit: 0.6, title: "Pampers Pure Protection Diapers Size 6", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-33.png" },
  { sr: 40, price: 164.88, profit: 0.4, title: "Mob Armor Mob Mount Switch Magnetic", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-16.png" }
];

export const TEMPLATE_C_3 = [
  { sr: 1, price: 460.44, profit: 4.6, title: "ELEMIS Pro-Collagen Marine Cream | Lightweight", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-49.png" },
  { sr: 2, price: 421.88, profit: 4.3, title: "Proactiv Acne Cleanser - Benzoyl Peroxide", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-45.png" },
  { sr: 3, price: 450.99, profit: 5.1, title: "Farmonics Ubtan Natural Face Wash with", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-46.png" },
  { sr: 4, price: 460.66, profit: 6.4, title: "BOSS Men’s Authentic Pants", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-50.png" },
  { sr: 5, price: 433.74, profit: 5.5, title: "NovoGlow No.1 Paris for Women -", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-31.png" },
  { sr: 6, price: 421.88, profit: 5.9, title: "Proactiv Acne Cleanser - Benzoyl Peroxide", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cj-45.png" },
  { sr: 7, price: 441.77, profit: 5.8, title: "Lacoste Men’s Sport Fleece Joggernon Deal", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-52.png" },
  { sr: 8, price: 460.44, profit: 4.9, title: "ELEMIS Pro-Collagen Marine Cream | Lightweight", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-49.png" },
  { sr: 9, price: 433.93, profit: 5, title: "Gen3 Marine Centric Folding Boat Seat", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-47.png" },
  { sr: 10, price: 460.66, profit: 6.4, title: "BOSS Men’s Authentic Pants", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-50.png" },
  { sr: 11, price: 499.65, profit: 7.9, title: "PIOJNYEN 26.5 Lbs Rice Dispenser Large", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-56.png" },
  { sr: 12, price: 510.88, profit: 13.6, title: "Eyeshadow Palette with Mirror", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-41.png" },
  { sr: 13, price: 769.84, profit: 129.66, title: "Lacoste Men’s Bold Graphic Jogger Sweatpant", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-61.png" },
  { sr: 14, price: 890.77, profit: 20.1, title: "Rebecca Taylor Women’s Long Sleeve Animal", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-137.png" },
  { sr: 15, price: 888.54, profit: 20, title: "Byinns Womens Square Neck Sleeveless Ruffle", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-136.png" },
  { sr: 16, price: 920.77, profit: 25.95, title: "Rebecca Taylor Women’s Violet Fleur Belted", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-148.png" },
  { sr: 17, price: 930.11, profit: 30.46, title: "Rebecca Taylor Women’s Ruched Scoop Neck", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-150.png" },
  { sr: 18, price: 920.66, profit: 40.44, title: "Rebecca Taylor Womens Floral Print Ruffled", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-145.png" },
  { sr: 19, price: 1010.87, profit: 50.66, title: "Rebecca Taylor Women’s Delft Fleur Belted", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-147.png" },
  { sr: 20, price: 908.99, profit: 40.55, title: "Rebecca Taylor Women’s Short Sleeve Lurex", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-140.png" },
  { sr: 21, price: 1100.93, profit: 60.55, title: "MAGE MALE Mens Suits Dress Floral", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-134.png" },
  { sr: 22, price: 1179.66, profit: 50.94, title: "Rebecca Taylor Women’s Heavy Cotton Shirt", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-161.png" },
  { sr: 23, price: 1211.55, profit: 60.41, title: "Rebecca Taylor Women’s Long Sleeve Shadow", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-160.png" },
  { sr: 24, price: 1289.51, profit: 70.65, title: "Rebecca Taylor Women’s Ramie Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-156.png" },
  { sr: 25, price: 1236.88, profit: 60.79, title: "Rebecca Taylor Women’s Sleeveless Bromstick Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-162.png" },
  { sr: 26, price: 2232.87, profit: 397.65, title: "Upward Fit 20 Pack Bulk Yoga", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-179.png" },
  { sr: 27, price: 2601.88, profit: 120.99, title: "Xgody 2 in 1 Tablet 10.1", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-172.png" },
  { sr: 28, price: 2507.54, profit: 110.92, title: "Clutch Purse Evening Shoulder Pleated Bag", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-177.png" },
  { sr: 29, price: 2799.84, profit: 140.9, title: "Fullgaden Exercise Ball (55-75cm) with Quick", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-178.png" },
  { sr: 30, price: 2675.8, profit: 130.8, title: "Manduka eQua Yoga Mat Towel -", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-186.png" },
  { sr: 31, price: 3100.66, profit: 167.25, title: "Yoga Towel - Tie-Die Textures Non-Slip", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-185.png" },
  { sr: 32, price: 4826.26, profit: 867.31, title: "Christian Dior Jadore By Christian Dior", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-201.png" },
  { sr: 33, price: 5550.59, profit: 280.88, title: "Givenchy L’interdit Women", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-204.png" },
  { sr: 34, price: 5498.77, profit: 263.22, title: "GIORGIO ARMANI - Armani Code Eau", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-203.png" },
  { sr: 35, price: 6100.69, profit: 300.6, title: "CHRISTIAN DIOR J’Adore Women Eau De", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-206.png" },
  { sr: 36, price: 5900.51, profit: 400.6, title: "Sukeen Cooling Towel for Neck and", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-190.png" },
  { sr: 37, price: 5821.63, profit: 398.22, title: "Mongoose Fireball Dirt Jump Mens and", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-195.png" },
  { sr: 38, price: 6590.61, profit: 502.91, title: "Dolce & Gabbana The Only One", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-202.png" },
  { sr: 39, price: 11226.39, profit: 1567.31, title: "Schwinn Bonafide Men and Women Mountain", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-194.png" },
  { sr: 40, price: 18791.11, profit: 2852.77, title: "Lattafa Perfumes Asad for Unisex Eau", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-210.png" }
];

export const TEMPLATE_C_4 = [
  { sr: 1, price: 378.98, profit: 3.22, title: "Ted Baker Womens Knot Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-37.png" },
  { sr: 2, price: 390.22, profit: 4.1, title: "Four 32x10-14 Tusk TERRABITE Heavy Duty", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-28.png" },
  { sr: 3, price: 370.35, profit: 3.7, title: "Elfeves Lot 4 PCS Classic Men’s", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-4.png" },
  { sr: 4, price: 380.43, profit: 3.8, title: "Ted Baker Women Plain Bow Icon", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-38.png" },
  { sr: 5, price: 390.11, profit: 4, title: "4PCS Women Fashion Handbags Purses Wallet", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-35.png" },
  { sr: 6, price: 360.43, profit: 3.1, title: "3.1 Phillip Lim Saddle Bag", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-34.png" },
  { sr: 7, price: 388.55, profit: 3.8, title: "Heavy-Duty 180° Adjustable 2.0 Tubular Clamp", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-24.png" },
  { sr: 8, price: 367.98, profit: 3.2, title: "Walker Products 350-34639 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-26.png" },
  { sr: 9, price: 386.43, profit: 4.1, title: "Carolina Herrera Good Girl Eau de", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-30.png" },
  { sr: 10, price: 387.99, profit: 4.2, title: "By Kilian - Black Phantom -", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-39.png" },
  { sr: 11, price: 360.43, profit: 3.1, title: "3.1 Phillip Lim Saddle Bag", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-34.png" },
  { sr: 12, price: 400.08, profit: 4.5, title: "Walker Products 350-64022 Oxygen Sensor", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-23.png" },
  { sr: 13, price: 693.66, profit: 112.47, title: "Lacoste Men’s Sport Brushed Fleece Pant", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-54.png" },
  { sr: 14, price: 799.54, profit: 19.45, title: "Alex Evenings Women’s A-line Lace Evening", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-129.png" },
  { sr: 15, price: 786.99, profit: 18.55, title: "Essence Mascara Lash Princess", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-40.png" },
  { sr: 16, price: 800.1, profit: 23.22, title: "Rebecca Taylor Women’s Marseille Stripe Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-143.png" },
  { sr: 17, price: 765.54, profit: 17.88, title: "Lacoste Men’s Regular Fit Tournament Sport", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-55.png" },
  { sr: 18, price: 799.99, profit: 20.11, title: "FARYSAYS Summer Dresses for Women Sleeveless", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-141.png" },
  { sr: 19, price: 803.48, profit: 21.22, title: "HAOMEILI Women’s Summer Dress Deep V", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-135.png" },
  { sr: 20, price: 806.39, profit: 22, title: "Ted Baker Cillaah Ponte Bodice Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-133.png" },
  { sr: 21, price: 785.97, profit: 19.33, title: "PAIGE Women’s Cindy Maternity Jeans", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-58.png" },
  { sr: 22, price: 921.88, profit: 30.46, title: "Rebecca Taylor Women’s Sleeveless Stripe Wrap", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-149.png" },
  { sr: 23, price: 867.99, profit: 25.47, title: "Adrianna Papell Women’s Metallic Jacquard Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-130.png" },
  { sr: 24, price: 856.5, profit: 24.5, title: "Rebecca Taylor Women’s Cupro Shirt Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-144.png" },
  { sr: 25, price: 898.06, profit: 24.55, title: "Rebecca Taylor Women’s Short Sleeve Dot", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-138.png" },
  { sr: 26, price: 1610.75, profit: 286.93, title: "siliteelon Women High Waist Casual Wide", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-158.png" },
  { sr: 27, price: 1856.44, profit: 50.44, title: "45W USB C Super Fast Charger", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-169.png" },
  { sr: 28, price: 1877.99, profit: 49.44, title: "Rebecca Taylor Women’s Long Sleeve V-Neck", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-157.png" },
  { sr: 29, price: 1930.44, profit: 52.79, title: "ACR ResQLink View - Buoyant Personal", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-170.png" },
  { sr: 30, price: 1899.86, profit: 49.65, title: "Google Pixel 6 Pro - 5G", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-175.png" },
  { sr: 31, price: 2008.55, profit: 62.44, title: "VEVOR Retractable Extension Cord Reel 65", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-171.png" },
  { sr: 32, price: 3445.90, profit: 589.44, title: "NUTSAAKK Yoga Mat Holder Wall Mount", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-181.png" },
  { sr: 33, price: 3997.99, profit: 70.45, title: "Rebecca Taylor Women’s Sleeveless Scarlet Wrap", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-165.png" },
  { sr: 34, price: 4001.33, profit: 80.23, title: "PRUKIVRA Non Slip Yoga Towel with", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-188.png" },
  { sr: 35, price: 3879.66, profit: 77.56, title: "iJoy Headphones Wireless Bluetooth- Wireless Sports", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-183.png" },
  { sr: 36, price: 4111.43, profit: 81.44, title: "Crostice Bike Mat Compatible with Peloton", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-189.png" },
  { sr: 37, price: 3999.99, profit: 79.7, title: "Nisorpa Yoga Auxiliary Foldable Chair with", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-182.png" },
  { sr: 38, price: 4324.44, profit: 85.45, title: "Huffy Stone Mountain Bike", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-193.png" },
  { sr: 39, price: 7374.72, profit: 1482.39, title: "KHADLAJ PERFUMES Hareem Al Sultan Concentrated", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-205.png" },
  { sr: 40, price: 14384.93, profit: 2914.53, title: "Marc Jacobs Daisy Dream Eau de", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-209.png" }
];

export const TEMPLATE_C_5 = [
  { sr: 1, price: 750.55, profit: 6.44, title: "Powder Canister", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-42.png" },
  { sr: 2, price: 711.76, profit: 6.9, title: "Lacoste Men’s Sport Tennis Shorts", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-51.png" },
  { sr: 3, price: 743.77, profit: 7.9, title: "PAIGE Women’s Allure Short Raw Hem", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-59.png" },
  { sr: 4, price: 769.33, profit: 7.43, title: "TrumKiFier RC Boat for Kids", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-48.png" },
  { sr: 5, price: 721.77, profit: 6.9, title: "Red Nail Polish", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-44.png" },
  { sr: 6, price: 777.81, profit: 8, title: "Red Lipstick", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-43.png" },
  { sr: 7, price: 801.22, profit: 9.5, title: "Rebecca Taylor Women’s Smocked Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-139.png" },
  { sr: 8, price: 799.43, profit: 8.3, title: "PAIGE womens Carly Jumpsuit Short Sleeve", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-132.png" },
  { sr: 9, price: 800.3, profit: 8.6, title: "Rebecca Taylor Women’s Labyrinth Slip Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-146.png" },
  { sr: 10, price: 751.7, profit: 7.4, title: "Mizuno Prospect Softball Pant", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-57.png" },
  { sr: 11, price: 811.7, profit: 9.1, title: "Janasya Women’s Mustard Foil Printed Poly", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-128.png" },
  { sr: 12, price: 729.11, profit: 6.4, title: "Lacoste Men’s Slim Fit Stretch Denim", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-53.png" },
  { sr: 13, price: 831.55, profit: 10.2, title: "Lacoste Women’s Short Sleeve Slim Fit", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-142.png" },
  { sr: 14, price: 791.54, profit: 7.8, title: "Lacoste Mens Sport Tennis Fleece Short", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-60.png" },
  { sr: 15, price: 870.33, profit: 11.5, title: "Adrianna Papell Stretch Crepe Jumpsuit with", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-131.png" },
  { sr: 16, price: 1329.64, profit: 256.1, title: "Rebecca Taylor womens Check Romper", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-155.png" },
  { sr: 17, price: 1500.22, profit: 56.87, title: "Rebecca Taylor Women’s Agnes Embroidery Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-152.png" },
  { sr: 18, price: 1600.34, profit: 60.4, title: "YUAKOU Women’s Tulle Petticoat Crinoline Half", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-154.png" },
  { sr: 19, price: 1476.65, profit: 40.5, title: "Rebecca Taylor Women’s Godet Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-159.png" },
  { sr: 20, price: 1621.87, profit: 50.6, title: "Adrianna Papell Women’s Metallic Knit Draped", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-166.png" },
  { sr: 21, price: 1438.91, profit: 39.4, title: "MSemis Woman Sexy Mesh Sheer Transparent", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-153.png" },
  { sr: 22, price: 1830.43, profit: 70.52, title: "Rebecca Taylor Women’s Sleeveless V-Neck Tweed", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-168.png" },
  { sr: 23, price: 1654.98, profit: 50.22, title: "Rebecca Taylor Women’s Daphne Fleur Dress", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-151.png" },
  { sr: 24, price: 1794.88, profit: 60.12, title: "Adrianna Papell Women’s Beaded Short Cocktail", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-167.png" },
  { sr: 25, price: 1887.53, profit: 70.33, title: "Rebecca Taylor Women’s Long Sleeve Star", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-164.png" },
  { sr: 26, price: 1997.55, profit: 90.5, title: "Lenovo Tab P11 (2nd Gen) -", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-173.png" },
  { sr: 27, price: 1876.87, profit: 76.9, title: "Rebecca Taylor Women’s Long Sleeve Perla", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-163.png" },
  { sr: 28, price: 3324.44, profit: 345.45, title: "Huffy Stone Mountain Bike", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-193.png" },
  { sr: 29, price: 3445.9, profit: 50.44, title: "NUTSAAKK Yoga Mat Holder Wall Mount", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-181.png" },
  { sr: 30, price: 3997.99, profit: 60.45, title: "Rebecca Taylor Women’s Sleeveless Scarlet Wrap", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-165.png" },
  { sr: 31, price: 4001.33, profit: 70.23, title: "PRUKIVRA Non Slip Yoga Towel with", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-188.png" },
  { sr: 32, price: 3879.66, profit: 67.56, title: "iJoy Headphones Wireless Bluetooth- Wireless Sports", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-183.png" },
  { sr: 33, price: 4111.43, profit: 71.44, title: "Crostice Bike Mat Compatible with Peloton", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-189.png" },
  { sr: 34, price: 3999.99, profit: 69.7, title: "Nisorpa Yoga Auxiliary Foldable Chair with", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-182.png" },
  { sr: 35, price: 4324.44, profit: 75.45, title: "Huffy Stone Mountain Bike", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-193.png" },
  { sr: 36, price: 4212.5, profit: 70.8, title: "Schwinn Bonafide Men and Women Mountain", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-194.png" },
  { sr: 37, price: 4456.7, profit: 75.4, title: "Dolce & Gabbana The Only One", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-202.png" },
  { sr: 38, price: 4388.9, profit: 73.2, title: "GIORGIO ARMANI - Armani Code Eau", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-203.png" },
  { sr: 39, price: 4511.4, profit: 76.5, title: "Christian Dior Jadore By Christian Dior", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-201.png" },
  { sr: 40, price: 4490.6, profit: 74.8, title: "Marc Jacobs Daisy Dream Eau de", image: "https://zxamlpfvggvoynhssbzd.supabase.co/storage/v1/object/public/cb_storage/products/cj-209.png" }
];

export default function OrdersTasking() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<any>({});
  const [products, setProducts] = useState<any[]>(PRODUCT_CATALOG);

  // Assignment Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [assignStep, setAssignModalStep] = useState(1); // 1: Main Config, 2: Worksheet Editor
  
  const [taskConfig, setTaskConfig] = useState({
    totalAmount: '',
    orderCount: '40',
    profitPercent: '5',
    template: 'Random'
  });

  const [worksheetOrders, setWorksheetOrders] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      const savedSession = localStorage.getItem('cb_admin_session');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }

      const { data, error } = await supabase
        .from('cb_users')
        .select('*')
        .order('reg_time', { ascending: false });

      if (!error && data) {
        let mapped = data.map(u => ({
          id: u.id,
          username: u.username,
          balance: parseFloat(u.balance || 0),
          nickname: u.nickname || '',
          phone: u.phone || '',
          level: u.level || 1,
          referred_by_staff_id: u.referred_by_staff_id || '',
          member_of_admin_id: u.member_of_admin_id || '',
          regTime: new Date(u.reg_time).toLocaleDateString()
        }));

        const s = JSON.parse(savedSession || '{}');
        if (s?.role === 'Admin') {
          mapped = mapped.filter(u => u.member_of_admin_id === s?.accountId);
        } else if (s?.role === 'Staff') {
          mapped = mapped.filter(u => u.referred_by_staff_id === s?.accountId);
        }

        setUsers(mapped);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const loadProducts = async () => {
    try {
      let activeProducts = PRODUCT_CATALOG;
      const { data: dbProducts } = await supabase.from('cb_products').select('*');
      if (dbProducts && dbProducts.length > 0) {
        activeProducts = dbProducts.map((p, idx) => ({
          id: p.id || `db-prod-${idx}`,
          title: p.title,
          image: p.image_url || p.image,
          type: p.type || 'gear',
          price: parseFloat(p.price || 0),
          profit: parseFloat(p.profit || 0)
        }));
      }
      setProducts(activeProducts);
    } catch (err) {
      console.error("Error loading products catalog:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    loadProducts();
    const interval = setInterval(() => {
      if (document.hidden) return; 
      fetchUsers();
    }, 20000); 
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAssignModal = (user: any) => {
    setSelectedUser(user);
    setTaskConfig({
      totalAmount: '',
      orderCount: '40',
      profitPercent: '5',
      template: 'Random'
    });
    setAssignModalStep(1);
    setShowAssignModal(true);
  };

  const generateWorksheet = () => {
    const amt = parseFloat(taskConfig.totalAmount);
    const count = parseInt(taskConfig.orderCount);
    const pYield = parseFloat(taskConfig.profitPercent);

    if (isNaN(amt) || amt <= 0) { toast.error("Please enter a valid total worksheet amount."); return; }
    if (isNaN(count) || count < 1) { toast.error("Please enter a valid order count."); return; }
    if (isNaN(pYield) || pYield < 0) { toast.error("Please enter a valid profit yield."); return; }

    let sequence = [];

    if (taskConfig.template === 'Random') {
      const basePrice = amt / count;
      for (let i = 0; i < count; i++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const variation = (Math.random() * 0.4) - 0.2; 
        const price = parseFloat((basePrice * (1 + variation)).toFixed(2));
        const profit = parseFloat((price * (pYield / 100)).toFixed(2));
        sequence.push({
          sr: i + 1,
          title: prod.title,
          image: prod.image,
          price,
          profit,
          status: 'Pending'
        });
      }
      const currentTotal = sequence.reduce((sum, o) => sum + o.price, 0);
      const diff = amt - currentTotal;
      sequence[sequence.length - 1].price = parseFloat((sequence[sequence.length - 1].price + diff).toFixed(2));
      sequence[sequence.length - 1].profit = parseFloat((sequence[sequence.length - 1].price * (pYield / 100)).toFixed(2));
    } else {
      let tpl = [];
      if (taskConfig.template === 'M-1') tpl = TEMPLATE_M_1;
      else if (taskConfig.template === 'M-2') tpl = TEMPLATE_M_2;
      else if (taskConfig.template === 'M-3') tpl = TEMPLATE_M_3;
      else if (taskConfig.template === 'M-4') tpl = TEMPLATE_M_4;
      else if (taskConfig.template === 'C-1') tpl = TEMPLATE_C_1;
      else if (taskConfig.template === 'C-2') tpl = TEMPLATE_C_2;
      else if (taskConfig.template === 'C-3') tpl = TEMPLATE_C_3;
      else if (taskConfig.template === 'C-4') tpl = TEMPLATE_C_4;
      else if (taskConfig.template === 'C-5') tpl = TEMPLATE_C_5;

      sequence = tpl.map(o => ({
        ...o,
        status: 'Pending'
      }));
    }

    setWorksheetOrders(sequence);
    setAssignModalStep(2);
  };

  const handleConfirmCreateTask = async () => {
    if (!selectedUser || worksheetOrders.length === 0) return;
    setIsCreating(true);

    try {
      const totalAmount = worksheetOrders.reduce((sum, o) => sum + parseFloat(o.price || 0), 0);
      const totalProfit = worksheetOrders.reduce((sum, o) => sum + parseFloat(o.profit || 0), 0);
      const avgProfitPercent = totalAmount > 0 ? (totalProfit / totalAmount) * 100 : 0;

      const { data: taskData, error: taskError } = await supabase
        .from('cb_assigned_tasks')
        .insert({
          user_id: selectedUser.id,
          username: selectedUser.username,
          total_amount: totalAmount,
          order_count: worksheetOrders.length,
          profit_percent: parseFloat(avgProfitPercent.toFixed(2)),
          status: 'In Progress',
          assigned_by: session.name || session.email,
          orders: worksheetOrders,
          referred_by_staff_id: selectedUser.referred_by_staff_id,
          member_of_admin_id: selectedUser.member_of_admin_id
        })
        .select()
        .single();

      if (taskError) {
        toast.error("Error creating worksheet task: " + taskError.message);
        setIsCreating(false);
        return;
      }

      const ordersToInsert = worksheetOrders.map((o, idx) => ({
        user_id: selectedUser.id,
        username: selectedUser.username,
        title: o.title,
        image: o.image,
        price: o.price,
        profit: o.profit,
        status: 'Pending',
        assigned_task_id: taskData.id,
        assigned_order_index: idx,
        referred_by_staff_id: selectedUser.referred_by_staff_id,
        member_of_admin_id: selectedUser.member_of_admin_id
      }));

      const { error: ordersError } = await supabase.from('cb_orders').insert(ordersToInsert);

      if (ordersError) {
        toast.error("Worksheet created, but error assigning orders: " + ordersError.message);
      } else {
        toast.success(`Successfully assigned worksheet with ${worksheetOrders.length} orders to ${selectedUser.username}!`);
        setShowAssignModal(false);
        setSelectedUser(null);
        setWorksheetOrders([]);
      }
    } catch (err: any) {
      toast.error("Operation failed: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-indigo-500" />
              Order Tasking & Allocation
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Assign new order worksheets and sequences to clients for commission matching.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/10 px-4 py-2 rounded-2xl">
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Global Nodes Online</span>
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </div>
        </div>
      </Card>

      {/* User Search & Selection Card */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Step 1: Select Target Client</h4>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Search and select a user to begin allocation</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search username, ID, or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Profile</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Summary</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Ownership</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                    No matching users found in your node directory.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                          {u.username.substring(0,2)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{u.username}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {u.id.substring(0,8)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded-lg w-fit">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">${u.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Database className="w-3 h-3 text-indigo-400" />
                        {u.referred_by_staff_id || 'Root System'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.regTime}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="sm" 
                        onClick={() => handleOpenAssignModal(u)}
                        className="h-8 text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                        icon={<UserPlus className="w-3.5 h-3.5" />}
                      >
                        Assign Task
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assignment Modal */}
      {showAssignModal && selectedUser && (
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title={`Worksheet Allocation: ${selectedUser.username}`}
          size={assignStep === 2 ? 'lg' : 'md'}
        >
          {assignStep === 1 ? (
            <div className="space-y-6">
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed uppercase tracking-tight">
                  Configure the primary parameters for this client's next order sequence. You can choose a pre-defined market template or generate a balanced random set.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="TOTAL WORKSHEET VALUE ($)"
                  type="number"
                  placeholder="e.g. 500.00"
                  value={taskConfig.totalAmount}
                  onChange={(e) => setTaskConfig(prev => ({ ...prev, totalAmount: e.target.value }))}
                  icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
                />
                <Input
                  label="PROFIT YIELD PERCENT (%)"
                  type="number"
                  placeholder="e.g. 5.0"
                  value={taskConfig.profitPercent}
                  onChange={(e) => setTaskConfig(prev => ({ ...prev, profitPercent: e.target.value }))}
                  icon={<TrendingUp className="w-4 h-4 text-indigo-500" />}
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ORDER SEQUENCE COUNT</label>
                  <select 
                    value={taskConfig.orderCount}
                    onChange={(e) => setTaskConfig(prev => ({ ...prev, orderCount: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 appearance-none transition-all"
                  >
                    <option value="40">40 Orders (Standard)</option>
                    <option value="1">1 Order (Single)</option>
                    <option value="10">10 Orders</option>
                    <option value="20">20 Orders</option>
                    <option value="30">30 Orders</option>
                    <option value="50">50 Orders</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ALGORITHM / TEMPLATE</label>
                  <select 
                    value={taskConfig.template}
                    onChange={(e) => setTaskConfig(prev => ({ ...prev, template: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 appearance-none transition-all"
                  >
                    <option value="Random">Balanced Random Sequence</option>
                    <optgroup label="Merchant Market Templates">
                      <option value="M-1">Template M-1 (Fixed Sequence)</option>
                      <option value="M-2">Template M-2 (Fixed Sequence)</option>
                      <option value="M-3">Template M-3 (Fixed Sequence)</option>
                      <option value="M-4">Template M-4 (Fixed Sequence)</option>
                    </optgroup>
                    <optgroup label="Consumer Catalog Templates">
                      <option value="C-1">Template C-1 (Fixed Sequence)</option>
                      <option value="C-2">Template C-2 (Fixed Sequence)</option>
                      <option value="C-3">Template C-3 (Fixed Sequence)</option>
                      <option value="C-4">Template C-4 (Fixed Sequence)</option>
                      <option value="C-5">Template C-5 (Fixed Sequence)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  onClick={generateWorksheet} 
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 text-[11px] font-black uppercase tracking-widest"
                  icon={<Zap className="w-4 h-4" />}
                >
                  Configure Worksheet Sequence
                </Button>
                <Button variant="secondary" onClick={() => setShowAssignModal(false)} className="w-full">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Step 2: Sequence Audit</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Review and manual override items before deployment</p>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Sequence Value</div>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                    ${worksheetOrders.reduce((sum, o) => sum + o.price, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
                {worksheetOrders.map((order, idx) => (
                  <Card key={idx} className="p-4 border-slate-200 dark:border-slate-800 group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[10px] font-black font-mono text-slate-400 border border-slate-200 dark:border-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center bg-white shrink-0 overflow-hidden">
                        {order.image ? <img src={order.image} className="max-w-full max-h-full object-contain" /> : <Package className="w-6 h-6 text-slate-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <input 
                            type="text"
                            value={order.title}
                            onChange={(e) => {
                              const newOrders = [...worksheetOrders];
                              newOrders[idx].title = e.target.value;
                              setWorksheetOrders(newOrders);
                            }}
                            className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                          />
                          <button 
                            onClick={() => {
                              const newOrders = worksheetOrders.filter((_, i) => i !== idx);
                              setWorksheetOrders(newOrders);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">PRICE ($)</span>
                            <div className="relative">
                              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                              <input 
                                type="number"
                                step="0.01"
                                value={order.price}
                                onChange={(e) => {
                                  const newOrders = [...worksheetOrders];
                                  newOrders[idx].price = parseFloat(e.target.value || '0');
                                  newOrders[idx].profit = parseFloat((newOrders[idx].price * (parseFloat(taskConfig.profitPercent) / 100)).toFixed(2));
                                  setWorksheetOrders(newOrders);
                                }}
                                className="w-full h-8 pl-7 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">COMMISSION ($)</span>
                            <div className="relative">
                              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-400" />
                              <input 
                                type="number"
                                step="0.01"
                                value={order.profit}
                                onChange={(e) => {
                                  const newOrders = [...worksheetOrders];
                                  newOrders[idx].profit = parseFloat(e.target.value || '0');
                                  setWorksheetOrders(newOrders);
                                }}
                                className="w-full h-8 pl-7 pr-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 font-mono text-xs font-black text-emerald-600 outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <button 
                  onClick={() => {
                    const prod = products[Math.floor(Math.random() * products.length)];
                    setWorksheetOrders([...worksheetOrders, {
                      sr: worksheetOrders.length + 1,
                      title: prod.title,
                      image: prod.image,
                      price: 0,
                      profit: 0,
                      status: 'Pending'
                    }]);
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Custom Sequence Item
                </button>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button variant="secondary" onClick={() => setAssignModalStep(1)} className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black">
                  Back to Config
                </Button>
                <Button 
                  onClick={handleConfirmCreateTask} 
                  loading={isCreating}
                  className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-[10px] font-black"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Deploy Task Sequence
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
