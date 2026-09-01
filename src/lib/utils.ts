import { Product } from '../types/product';
import { BUSINESS_CONFIG } from '../config/business';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('uz-UZ').format(price) + ' ' + BUSINESS_CONFIG.currency;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateTelegramProductLink(product: Product, selectedSize?: string, selectedColor?: string): string {
  const text = `Salom! Men "${product.name}" mahsuloti haqida ma'lumot olmoqchiman.%0A%0A` +
    `📌 Narxi: ${formatPrice(product.price)}%0A` +
    `🏷️ Kod (SKU): ${product.sku}%0A` +
    (selectedSize ? `📏 Tanlangan o'lcham: ${selectedSize}%0A` : '') +
    (selectedColor ? `🎨 Tanlangan rang: ${selectedColor}%0A` : '') +
    `%0ADo'konda bormi va qachon ko'rishim mumkin?`;

  return `${BUSINESS_CONFIG.telegram}?text=${text}`;
}

export function generateTelegramGeneralLink(): string {
  const text = `Salom! Ecommerce do'koni bo'yicha savolim bor edi.`;
  return `${BUSINESS_CONFIG.telegram}?text=${encodeURIComponent(text)}`;
}
