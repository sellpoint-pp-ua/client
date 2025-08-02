'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'

interface ClothingProductCardProps {
  title: string
  price: number
  oldPrice?: number
  image: string
  brand: string
  rating: number
  reviewCount: number
  size: string
  color: string
  material: string
  isReadyToShip: boolean
  href: string
}

export default function ClothingProductCard({
  title,
  price,
  oldPrice,
  image,
  brand,
  rating,
  reviewCount,
  size,
  color,
  material,
  isReadyToShip,
  href
}: ClothingProductCardProps) {
  return (
    <div className="group relative rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative mb-4 aspect-square overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <button
          className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-gray-400 transition-colors hover:text-[#7B1FA2]"
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5" />
        </button>
        {isReadyToShip && (
          <div className="absolute left-2 top-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Готовий до відправки
          </div>
        )}
      </div>
      
      <Link href={href} className="block">
        <p className="mb-1 text-sm font-medium text-[#7B1FA2]">{brand}</p>
        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-900">
          {title}
        </h3>
        
        <div className="mb-2 flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`h-4 w-4 text-${i < rating ? 'yellow' : 'gray'}-400`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{price} ₴</span>
            {oldPrice && (
              <span className="text-sm text-gray-500 line-through">
                {oldPrice} ₴
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1 text-xs text-gray-600">
          <p>Розмір: {size}</p>
          <p>Колір: {color}</p>
          <p>Матеріал: {material}</p>
        </div>
      </Link>
    </div>
  )
} 