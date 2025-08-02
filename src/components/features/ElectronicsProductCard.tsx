'use client'

import Image from 'next/image'
import { Heart, Star, ShoppingCart, Truck } from 'lucide-react'
import Link from 'next/link'

interface ElectronicsProductCardProps {
  id: string
  title: string
  price: number
  oldPrice?: number
  imageUrl: string
  rating: number
  reviewCount: number
  isAvailable: boolean
  isReadyToShip: boolean
}

export default function ElectronicsProductCard({
  id,
  title,
  price,
  oldPrice,
  imageUrl,
  rating,
  reviewCount,
  isAvailable,
  isReadyToShip,
}: ElectronicsProductCardProps) {
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0

  return (
    <div className="group relative rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {oldPrice && (
        <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white z-40">
          -{discount}%
        </div>
      )}
      
      <button
        className="absolute right-4 top-4 rounded-full bg-white p-1.5 text-gray-400 opacity-0 transition-opacity hover:text-[#7B1FA2] group-hover:opacity-100"
        aria-label="Add to favorites"
      >
        <Heart className="h-5 w-5" />
      </button>
      
      <Link href={`/tehnika-ta-elektronika/product/${id}`}>
        <div className="relative mb-4 aspect-square overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain transition-transform group-hover:scale-105"
          />
        </div>
        
        <div className="mb-2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
          <span className="ml-1 text-xs text-gray-500">({reviewCount})</span>
        </div>

        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm text-gray-700 hover:text-[#7B1FA2]">
          {title}
        </h3>

        <div className="mb-3 space-y-1">
          {oldPrice && (
            <p className="text-sm text-gray-500 line-through">
              {oldPrice.toLocaleString('uk-UA')} ₴
            </p>
          )}
          <p className="text-lg font-semibold text-[#7B1FA2]">
            {price.toLocaleString('uk-UA')} ₴
          </p>
        </div>

        <div className="space-y-2">
          {isAvailable ? (
            <p className="flex items-center gap-1 text-xs text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-600"></span>
              В наявності
            </p>
          ) : (
            <p className="text-xs text-gray-500">Немає в наявності</p>
          )}
          
          {isReadyToShip && (
            <p className="flex items-center gap-1 text-xs text-blue-600">
              <Truck className="h-4 w-4" />
              Готовий до відправки
            </p>
          )}
        </div>
      </Link>

      {isAvailable && (
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7B1FA2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6a1b8c]">
          <ShoppingCart className="h-4 w-4" />
          В кошик
        </button>
      )}
    </div>
  )
} 