'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'

interface ApiProductCardProps {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  hasDiscount?: boolean;
  finalPrice?: number;
  discountPercentage?: number;
  quantityStatus?: string;
  quantity?: number;
  imageUrl?: string; // optional hardcoded image for demo data
}

export default function ApiProductCard({ 
  id, 
  name, 
  price,
  discountPrice,
  hasDiscount,
  finalPrice,
  discountPercentage,
  quantityStatus,
  quantity,
  imageUrl: providedImageUrl,
}: ApiProductCardProps) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const title = name || 'Без назви'
  const normalizedStatus = (quantityStatus || '').toLowerCase()
  const isReadyToShip = normalizedStatus.includes('готов') || normalizedStatus.includes('ready')

  
  type StockState = 'in' | 'low' | 'out'
  const stockState: StockState = (() => {
    if (!quantityStatus) {
      if (typeof quantity === 'number') {
        if (quantity <= 0) return 'out'
        if (quantity <= 3) return 'low'
        return 'in'
      }
      return 'in'
    }
    if (normalizedStatus.includes('немає') || normalizedStatus.includes('відсут') || normalizedStatus.includes('out')) {
      return 'out'
    }
    if (
      normalizedStatus.includes('зік') || 
      normalizedStatus.includes('закінч') ||
      normalizedStatus.includes('low')
    ) {
      return 'low'
    }
  
    return 'in'
  })()

  const isAvailable = stockState !== 'out'
  const availabilityBadge = (() => {
    if (stockState === 'in') {
      return { text: 'В наявності', classes: 'bg-green-100 text-green-800' }
    }
    if (stockState === 'low') {
      return { text: 'Закінчується', classes: 'bg-orange-100 text-orange-800' }
    }
    return { text: 'Немає в наявності', classes: 'bg-red-100 text-red-800' }
  })()

 
  const primaryPrice = hasDiscount ? (finalPrice ?? discountPrice ?? price) : price
  const showOldPrice = Boolean(hasDiscount && price && primaryPrice && price > primaryPrice)
  const priceDisplay = `${Math.round(primaryPrice)} грн`

  useEffect(() => {
    async function fetchProductImage() {
      try {
        const response = await fetch(`/api/products/media/${id}`)
        if (response.ok) {
          const media = await response.json()
          if (media.length > 0) {
            type MediaItem = { url?: string; secondaryUrl?: string; order?: number }
            const sortedMedia = (media as Array<MediaItem>).sort((a, b) => (a.order || 0) - (b.order || 0))
            const firstImage = sortedMedia[0]
            setResolvedImageUrl(firstImage.url || firstImage.secondaryUrl || '')
          }
        }
      } catch (error) {
        console.error('Error fetching product image:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (providedImageUrl) {
      setResolvedImageUrl(providedImageUrl)
      setIsLoading(false)
      return
    }

    fetchProductImage()
  }, [id, providedImageUrl])

  return (
    <div className="group relative rounded-lg bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <button
        className="absolute right-4 top-4 z-10 rounded-full bg-white p-1.5 text-gray-400 opacity-0 transition-opacity hover:text-[#4563d1] group-hover:opacity-100"
        aria-label="Add to favorites"
      >
        <Heart className="h-5 w-5" />
      </button>
      
      <Link href={`/product/${id}`}>
        <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#4563d1]"></div>
            </div>
          ) : resolvedImageUrl ? (
            <Image
              src={resolvedImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <span className="text-gray-400">Немає фото</span>
            </div>
          )}
        </div>
        
        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm text-gray-700">
          {title}
        </h3>

        <div className="mb-2 flex items-center gap-2">
          <span 
            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${availabilityBadge.classes}`}
          >
            {availabilityBadge.text}
          </span>
        </div>
        
        <div className="mb-2 flex items-baseline gap-2">
          <p className="text-[18px] md:text-lg font-semibold whitespace-nowrap">
            {priceDisplay}
          </p>
          {showOldPrice && (
            <span className="text-sm text-gray-400 line-through whitespace-nowrap">{Math.round(price)} грн</span>
          )}
          {hasDiscount && discountPercentage ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded bg-red-50 px-3 py-0.5 text-sm font-medium text-red-700 whitespace-nowrap">
              -{discountPercentage}%
            </span>
          ) : null}
        </div>
        
        
        {isReadyToShip && (
          <p className="mb-3 text-xs text-blue-600">
            Готовий до відправки
          </p>
        )}
      </Link>
      
      <button 
        className="w-full rounded-full bg-[#4563d1] px-2 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#6A1B9A] disabled:bg-gray-300"
        disabled={!isAvailable}
        onClick={(e) => {
          e.preventDefault()
          console.log('Add to cart:', id)
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          В кошик
        </div>
      </button>
    </div>
  )
}