import { Injectable } from '@nestjs/common';

@Injectable()
export class FormattersService {
  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  }

  formatPriceWithoutSymbol(price: number): string {
    return price.toFixed(2);
  }

  parsePriceToNumber(price: string): number {
    // Enlever le symbole MAD et les espaces, remplacer la virgule par un point
    const cleanPrice = price.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(cleanPrice);
  }
} 