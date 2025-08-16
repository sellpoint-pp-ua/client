'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'

interface BeautyProductCardProps {
  title: string
  price: number
  oldPrice?: number
  image: string
  brand: string
  rating: number
  reviewCount: number
  skinType: string
  volume: string
  href: string
}

export default function BeautyProductCard({
  title,
  price,
  oldPrice,
  image,
  brand,
  rating,
  reviewCount,
  skinType,
  volume,
  href
}: BeautyProductCardProps) {
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
          className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-gray-400 transition-colors hover:text-[#4563d1]"
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>
      
      <Link href={href} className="block">
        <p className="mb-1 text-sm font-medium text-[#4563d1]">{brand}</p>
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
          <p>Тип шкіри: {skinType}</p>
          <p>Об&apos;єм: {volume}</p>
        </div>
      </Link>
    </div>
  )
} 