'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
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
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      {/* Medicine Image Placeholder */}
      <div className="h-40 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
        <div className="text-4xl">💊</div>
      </div>

      <div className="p-4">
        {/* Medicine Name */}
        <h3 className="text-lg font-bold text-foreground line-clamp-2">
          {medicine.name}
        </h3>

        {/* Category */}
        <p className="mt-1 text-xs text-primary font-semibold">{medicine.category}</p>

        {/* Description */}
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {medicine.description}
        </p>

        {/* Stock Status */}
        <div className="mt-3 flex items-center gap-2">
          {medicine.inStock ? (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-semibold text-green-600">In Stock</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              <span className="text-xs font-semibold text-gray-600">Out of Stock</span>
            </>
          )}
        </div>

        {/* Quantity in Cart */}
        {quantity > 0 && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-2 py-1">
            <Check className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-700 font-semibold">
              {quantity} in cart
            </span>
          </div>
        )}

        {/* Price and Button */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-2xl font-bold text-foreground">
              Tk {medicine.price}
            </p>
            <p className="text-xs text-muted-foreground">per unit</p>
          </div>
          <Button
            disabled={!medicine.inStock}
            onClick={() => onAddToCart(medicine, 1)}
            size="sm"
            className="rounded-lg"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
