'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Pill } from 'lucide-react';
import type { Medicine } from '@/types';

interface MedicineCardProps {
  medicine: Medicine;
  quantity?: number;
  onAddToCart: (medicine: Medicine, quantity: number) => void;
}

export function MedicineCard({
  medicine,
  quantity = 0,
  onAddToCart,
}: MedicineCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Medicine Image Placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 translate-y-8 blur-xl"></div>
        <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <Pill className="h-10 w-10 text-white" />
        </div>
        {medicine.inStock && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 rounded-full px-2.5 py-1 shadow-lg">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
            <span className="text-xs font-semibold text-white">In Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Medicine Name */}
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {medicine.name}
        </h3>

        {/* Category */}
        <span className="mt-2 inline-block text-xs font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2.5 py-1 rounded-full">
          {medicine.category}
        </span>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {medicine.description}
        </p>

        {/* Quantity in Cart */}
        {quantity > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-semibold">
              {quantity} in cart
            </span>
          </div>
        )}

        {/* Price and Button */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-border/50">
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              ৳{medicine.price}
            </p>
            <p className="text-xs text-muted-foreground">per unit</p>
          </div>
          <Button
            disabled={!medicine.inStock}
            onClick={() => onAddToCart(medicine, 1)}
            size="sm"
            className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:shadow-none"
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
