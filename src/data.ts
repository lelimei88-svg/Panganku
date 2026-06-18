import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // BAHAN POKOK UTAMA
  {
    id: 'beras-5kg',
    name: 'Beras Premium 5kg',
    price: 75000,
    originalPrice: 85000,
    category: 'pokok',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5GGJ2shdiSCCGZHUB6ci3gR4j2JWDrKZvScZZmValiiFC6vV-9jb9wpl2KD1JIlCzkCRLUgN0e63LlS3wnPylMrvThex7_6Lk8XUn7rUFq2sIxI1OltdeeBI008H3gXrHNmPgDLZWKdJAlG4mPgYULk4GG74yyNFlsq-d5UeH-TIDsJqijyoe9AFmmBbdXQl-hWMgtJXbhESIfe1fbsQm7ObkJ2flliVQjIzOg0FAhmdTCOt_PesoL30G80Is4C3ZlHoaKwVd2Zw',
    unit: '5kg',
    isBestSeller: true,
    discountTag: 'Hemat Rp 10.000',
    description: 'Beras poles super dengan tingkat kepecahan rendah. Diproses dengan teknologi modern untuk rasa pulen yang sempurna.'
  },
  {
    id: 'minyak-2l',
    name: 'Minyak Goreng 2L',
    price: 34000,
    category: 'pokok',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxjlCBa-Oavy7A-OsDvotNWpqKqKMSTr8spDHZFPYyPp_df-xk01SLivQ6AT6LjXNANXYtzzew6sqpFvv8UT0WgYzec8zC3fA0-aYQnQD5D8yiQZR9Xv1LU9n1DC9rQxinzTjtlUCdhVK5Za5QxUYa2I3vmRAOqSpFbuH7lAiZYp0Dqdoo1_8MJrPTdbwSEYF9XYOnHLEYLUpg-XJzCyHFSXF2DNMDRvuUmnF_ENWo4RiEIt5Z8StWzip6CEi56wWY84r6RPWkUcM',
    unit: '2L',
    description: 'Minyak kelapa sawit olahan murni berkualitas tinggi, jernih, dan tidak mudah berbusa.'
  },
  {
    id: 'telur-1kg',
    name: 'Telur Ayam 1kg',
    price: 28500,
    category: 'pokok',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjkDulupVUPIPFLeNAwom7KYyjm1vwwfA5FfMCoXbHDtCYWowLdUgMK-XN9xoIqtHmDIubiTvi03r-GYkFHJtYC7XeP7kaSMduVqwg3fw6xfb6ivw6dc2q2zpNc-fKL2dG-SrVwPcVOD2UquH8LrySjHxzvflWgRb1fqt2zrXHeEttjvhAnGV6bJ0uIE0HtwGNWC9ra2zXTKev-KMq3sfcjjgs1E-L0qltcO5WHkzIPuItMpUuVqvghlBRL8qKaX_0Q3UW7q7wAV4',
    unit: '1kg',
    description: 'Telur ayam negeri segar pilihan, langsung dari peternakan terpercaya.'
  },
  {
    id: 'gula-1kg',
    name: 'Gula Pasir 1kg',
    price: 16000,
    category: 'pokok',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMp8pUrPq7vsoUElVeYL8UI_2juURz1RHMVkz4mGmYzjbxuK5Y9XhEoO7z8Jz69tPvxnsuNj2_Vc5M7IF-E-fv_qLSogFFrQgfW_qXlObIkyam_SsNm4WceChTkAi0honz7okX7Euou2rgHmsvCZd6g6yFGZk_CztLCWUh63z9bKh6_3rBZDcj8oFxwwF1mGyFaydP_IL4CPYyEzKurFOH3ahCl6rYV35Vfvezm_QOHF_-D6OS2rbGxbvFW4LspP_J5mEBeskgyjo',
    unit: '1kg',
    description: 'Gula pasir kristal putih berkualitas premium, manis murni dan higienis.'
  },

  // BAHAN PENDUKUNG / PELENGKAP
  {
    id: 'bayam-organik',
    name: 'Bayam Organik',
    price: 12000,
    category: 'bumbu',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqQQE92KpgZt4oUiErPnwxWB6s1J9gwdAqVG35ZyYJKJ26qgRKuE-UTGhBbdQ33b-Kj8iwEIrprSbywpXmpLsZcd9wJXDxYskK8JpRSHdOyAIzX7Ht0UNyC0v_EaVXh2Fe_a49pN8FMd1IozHnxFeKE6lDzq66rIuB74oBtjjUaGi5qmIUgQS9u9WLQltVhqz5x1x3yPnwbLFV4RexvP5e3v87W-bNpfviVwkeojyDsPpv7GtrKvE0qCosB-I18NU8LhsLHKXGAI0',
    unit: '250 gram',
    description: 'Bayam organik segar bebas pestisida, kaya zat besi untuk kesehatan keluarga.'
  },
  {
    id: 'ayam-kampung',
    name: 'Ayam Kampung',
    price: 65000,
    category: 'siap-saji',
    image: '/images/ayam-kampung.jpg',
    unit: '1 Ekor (~0.8kg)',
    description: 'Daging ayam kampung segar, padat gizi, empuk, dan diproses secara halal.'
  },
  {
    id: 'bawang-merah',
    name: 'Bawang Merah 500g',
    price: 18000,
    category: 'bumbu',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=300&auto=format&fit=crop',
    unit: '500g',
    description: 'Bawang merah segar kupas kualitas premium, aromatis and padat.'
  },
  {
    id: 'bawang-putih',
    name: 'Bawang Putih 500g',
    price: 22000,
    category: 'bumbu',
    image: '/images/bawang-putih.jpg',
    unit: '500g',
    description: 'Bawang putih kating premium, siung besar dan aroma kuat.'
  },
  {
    id: 'cabai-rawit',
    name: 'Cabai Rawit 250g',
    price: 12000,
    category: 'bumbu',
    image: '/images/cabai-rawit.jpg',
    unit: '250g',
    description: 'Cabai rawit merah pedas segar dipetik langsung oleh petani lokal.'
  },
  {
    id: 'bakso-aci',
    name: 'Bakso Aci Instan',
    price: 15000,
    category: 'siap-saji',
    image: '/images/bakso-aci.jpg',
    unit: '1 Pack',
    description: 'Baso aci instan dengan bumbu lengkap, gurih, pedas, dan nikmat.'
  },
  {
    id: 'sosis-bakar',
    name: 'Sosis Bakar 500g',
    price: 45000,
    category: 'siap-saji',
    image: '/images/sosis-bakar.jpg',
    unit: '500g',
    description: 'Sosis sapi bakar ukuran jumbo yang lezat, gurih, dan berkualitas tinggi.'
  },
  {
    id: 'air-mineral',
    name: 'Air Mineral 600ml',
    price: 3500,
    category: 'minuman',
    image: '/images/air-mineral.jpg',
    unit: '600ml',
    description: 'Air mineral murni pegunungan sejuk dan menyegarkan tubuh.'
  },
  {
    id: 'susu-uht',
    name: 'Susu UHT 1L',
    price: 19500,
    category: 'minuman',
    image: '/images/susu-uht.jpg',
    unit: '1L',
    description: 'Susu cair segar UHT berlemak tinggi, penuh gizi kals.'
  },
  {
    id: 'kecap-manis',
    name: 'Kecap Manis 550ml',
    price: 24000,
    category: 'bumbu',
    image: '/images/kecap-manis.jpg',
    unit: '550ml',
    description: 'Kecap manis kental hitam gurih murni, penyedap masakan nusantara.'
  },
  {
    id: 'pop-mie',
    name: 'Pop Mie Goreng',
    price: 5500,
    category: 'siap-saji',
    image: '/images/pop-mie.jpg',
    unit: '1 Cup',
    description: 'Mie instan dalam cup rasa mie goreng spesial praktis tinggal seduh.'
  },
  {
    id: 'teh-kemasan',
    name: 'Teh Kemasan 330ml',
    price: 3000,
    category: 'minuman',
    image: '/images/teh-kemasan.jpg',
    unit: '330ml',
    description: 'Teh melati manis segar dalam kemasan botol siap minum.'
  }
];
