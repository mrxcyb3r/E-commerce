import React from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ProductCardProps {
  product: any
  currentImageIndex?: number
  setCurrentImageIndex?: (idx: number) => void
}

export function ProductCard({
  product,
  currentImageIndex = 0,
  setCurrentImageIndex,
}: ProductCardProps) {
  const imgSrc = product.images?.[currentImageIndex] || product.image || '/placeholder-product.jpg'
  const altText = product.title || product.name || 'Product'

  return (
    <div className="group rounded-md overflow-hidden bg-background transition-shadow hover-shadow-lg">
      <a href={`/products/${product.id}`} className="block">
        <img
          src={imgSrc}
          alt={altText}
          className="w-full h-64 object-cover transition-transform group-hover:scale-105"
        />
      </a>
      <div className="p-2">
        <h3 className="font-semibold line-clamp-2 text-zinc-950">{product.title || product.name}</h3>
        <p className="text-zinc-500 text-sm line-clamp-1">{product.description || ''}</p>
      </div>
    </div>
  )
}
