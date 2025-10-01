'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ThumbsUp, ThumbsDown, Store, ExternalLink, Trash2, CheckCircle } from 'lucide-react'

type ProductInfo = {
  id: string
  name: string
  price: number
  imageUrl?: string | null
  sellerId?: string
  sellerName?: string
  sellerAvatar?: string | null
}

type UserReview = {
  rating: number
  comment: string
  createdAt: string
  positiveCount: number
  negativeCount: number
}

type UserReviewCardProps = {
  productId: string
  review: UserReview
  onDelete?: (productId: string) => void
}

export default function UserReviewCard({ productId, review, onDelete }: UserReviewCardProps) {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadProductInfo = async () => {
      try {
        setLoading(true)
        
        // Загружаем информацию о продукте и медиа параллельно
        const [productRes, mediaRes] = await Promise.all([
          fetch(`https://api.sellpoint.pp.ua/api/Product/get-by-id/${productId}`),
          fetch(`https://api.sellpoint.pp.ua/api/ProductMedia/by-product-id/${productId}`).catch(() => null)
        ])
        
        if (!productRes.ok) return

        const productData = await productRes.json()
        const mediaData = mediaRes?.ok ? await mediaRes.json() : []
        
        if (cancelled) return

        // Загружаем информацию о продавце
        let sellerName = 'Продавець'
        let sellerAvatar = null

        if (productData?.sellerId) {
          try {
            const sellerRes = await fetch(`https://api.sellpoint.pp.ua/api/Store/GetStoreById?storeId=${encodeURIComponent(productData.sellerId)}`)
            if (sellerRes.ok) {
              const sellerData = await sellerRes.json()
              sellerName = sellerData?.name || 'Продавець'
              sellerAvatar = sellerData?.avatar?.sourceUrl || sellerData?.avatar?.compressedUrl || null
            }
          } catch {
            // Игнорируем ошибки загрузки продавца
          }
        }

        // Получаем первое изображение из медиа
        let imageUrl = null
        if (Array.isArray(mediaData) && mediaData.length > 0) {
          // Сортируем медиа по порядку и ищем первое изображение
          const sortedMedia = mediaData.sort((a, b) => (a.order || 0) - (b.order || 0))
          const firstImage = sortedMedia.find(item => 
            item.type === 'image' || 
            !item.type || 
            item.type === 'photo' ||
            item.type === 'picture'
          )
          // Извлекаем URL из структуры данных
          imageUrl = firstImage?.files?.sourceUrl || 
                    firstImage?.files?.url || 
                    firstImage?.files?.compressedUrl ||
                    firstImage?.sourceUrl || 
                    firstImage?.url || 
                    firstImage?.compressedUrl
          
          // Валидация URL
          if (imageUrl && !imageUrl.startsWith('http')) {
            console.log('Invalid URL format, adding protocol:', imageUrl)
            imageUrl = `https:${imageUrl}`
          }
          
          // Отладочная информация
          console.log('Media data for product', productId, ':', mediaData)
          console.log('First image found:', firstImage)
          console.log('Files object:', firstImage?.files)
          console.log('Available URLs:', {
            filesSourceUrl: firstImage?.files?.sourceUrl,
            filesUrl: firstImage?.files?.url,
            filesCompressedUrl: firstImage?.files?.compressedUrl,
            directSourceUrl: firstImage?.sourceUrl,
            directUrl: firstImage?.url,
            directCompressedUrl: firstImage?.compressedUrl
          })
          console.log('Final Image URL:', imageUrl)
          console.log('Is valid URL:', imageUrl && imageUrl.startsWith('http'))
        } else {
          console.log('No media data for product', productId)
          // Fallback: попробуем получить изображение из данных продукта
          if (productData?.images && Array.isArray(productData.images) && productData.images.length > 0) {
            imageUrl = productData.images[0]?.url || productData.images[0]?.sourceUrl
            console.log('Using fallback image from product data:', imageUrl)
          }
        }

        console.log('Setting product info:', {
          id: productId,
          name: productData?.name || 'Товар',
          price: productData?.price || 0,
          imageUrl,
          sellerId: productData?.sellerId,
          sellerName,
          sellerAvatar
        })

        setProductInfo({
          id: productId,
          name: productData?.name || 'Товар',
          price: productData?.price || 0,
          imageUrl,
          sellerId: productData?.sellerId,
          sellerName,
          sellerAvatar
        })
      } catch (error) {
        if (!cancelled) {
          setProductInfo({
            id: productId,
            name: 'Товар',
            price: 0,
            imageUrl: null,
            sellerId: undefined,
            sellerName: 'Продавець',
            sellerAvatar: null
          })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProductInfo()
    return () => { cancelled = true }
  }, [productId])

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      return
    }

    setIsDeleting(true)
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        alert('Потрібна авторизація')
        return
      }

      const response = await fetch(
        `https://api.sellpoint.pp.ua/api/ProductReview/RemoveCommentByMyId?productId=${encodeURIComponent(productId)}`,
        {
          method: 'DELETE',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Помилка видалення відгуку')
      }

      setShowDeleteSuccess(true)
      setTimeout(() => setShowDeleteSuccess(false), 3000)
      
      // Вызываем callback для обновления списка
      if (onDelete) {
        setTimeout(() => onDelete(productId), 1500)
      }

    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Помилка видалення відгуку')
    } finally {
      setIsDeleting(false)
    }
  }

  const dateStr = (() => { 
    try { 
      const d = new Date(review.createdAt)
      const dd = String(d.getDate()).padStart(2,'0')
      const mm = String(d.getMonth()+1).padStart(2,'0')
      const yy = d.getFullYear()
      return `${dd}.${mm}.${yy}` 
    } catch { 
      return '' 
    } 
  })()

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm animate-pulse">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm relative">
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Видалити відгук"
      >
        {isDeleting ? (
          <div className="h-5 w-5 animate-spin hover:cursor-pointer rounded-full border-2 border-gray-300 border-t-red-500" />
        ) : (
          <Trash2 className="h-5 w-5 hover:cursor-pointer" />
        )}
      </button>

      <div className="flex items-start gap-4">
        {/* Product Image */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {productInfo?.imageUrl ? (
            <>
              {console.log('Rendering image with URL:', productInfo.imageUrl)}
              {/* Временно используем обычный img для тестирования */}
              <img 
                src={productInfo.imageUrl} 
                alt={productInfo.name} 
                className="w-full h-full object-cover" 
                onLoad={() => console.log('Image loaded successfully:', productInfo.imageUrl)}
                onError={(e) => console.log('Image failed to load:', productInfo.imageUrl, e)}
              />
            </>
          ) : (
            <>
              {console.log('No image URL, showing placeholder')}
              <div className="flex items-center justify-center h-full w-full bg-gray-200">
                <Image src="/window.svg" alt="Товар" width={32} height={32} className="opacity-50" />
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <Link 
                href={`/product/${productId}`}
                className="text-lg font-semibold text-gray-900 hover:text-[#4563d1] transition-colors line-clamp-2 flex items-center gap-1"
                title={productInfo?.name || 'Товар'}
              >
                <span className="truncate">{productInfo?.name || 'Товар'}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </Link>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-[#E53935]">
                  {productInfo?.price?.toLocaleString('uk-UA')} грн
                </span>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-2 mt-2">
                {productInfo?.sellerAvatar && (
                  <img 
                    src={productInfo.sellerAvatar} 
                    alt={productInfo.sellerName || 'Продавець'} 
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <span className="text-sm text-gray-600">
                  {productInfo?.sellerName || 'Продавець'}
                </span>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="mt-2">
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}

              <div className="flex items-center ml-4 gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">{review.positiveCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm">{review.negativeCount}</span>
                </div>
              </div>

              <span className="ml-4 text-sm text-gray-600">{dateStr}</span>
            </div>
            <div className="text-sm text-gray-700 mb-2">
              {review.comment}
            </div>

          </div>
        </div>
        
      </div>

      {/* Success Notification */}
      {showDeleteSuccess && (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-right-5 duration-300">
        <div className="flex items-center gap-3 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Відгук успішно видалено!</span>
        </div>
      </div>
      )}
    </div>
  )
}
