'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Star, Store, AlertCircle, CheckCircle } from 'lucide-react'

type ProductInfo = {
  productId: string
  productName: string
  price: number
  discountPrice?: number
  hasDiscount?: boolean
  finalPrice?: number
  imageUrl?: string
  sellerId: string
  sellerName?: string
  sellerAvatar?: string
}

type ReviewModalProps = {
  isOpen: boolean
  onClose: () => void
  productInfo: ProductInfo | null
  onReviewSubmitted: () => void
}

export default function ReviewModal({ isOpen, onClose, productInfo, onReviewSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [sellerInfo, setSellerInfo] = useState<{ name: string; avatarUrl: string | null } | null>(null)
  const [loadingSeller, setLoadingSeller] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Сброс состояния при открытии/закрытии модального окна
  useEffect(() => {
    if (isOpen) {
      setRating(0)
      setHoverRating(0)
      setComment('')
      setError('')
      setSellerInfo(null)
      
      // Фокус на модальное окно для доступности
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Блокировка скролла и обработка клавиш при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY
      
      // Блокируем скролл
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      
      // Обработка клавиши Escape
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && !isSubmitting) {
          onClose()
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        // Восстанавливаем скролл при закрытии
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
        
        // Убираем обработчик клавиш
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, isSubmitting, onClose])

  // Загрузка информации о продавце
  useEffect(() => {
    if (!isOpen || !productInfo?.sellerId) return

    let cancelled = false
    const loadSellerInfo = async () => {
      try {
        setLoadingSeller(true)
        const response = await fetch(`https://api.sellpoint.pp.ua/api/Store/GetStoreById?storeId=${encodeURIComponent(productInfo.sellerId)}`)
        
        if (!response.ok) {
          setSellerInfo({ name: 'Продавець', avatarUrl: null })
          return
        }

        const sellerData = await response.json()
        
        if (!cancelled) {
          setSellerInfo({
            name: sellerData?.name || 'Продавець',
            avatarUrl: sellerData?.avatar?.sourceUrl || sellerData?.avatar?.compressedUrl || null
          })
        }
      } catch (error) {
        if (!cancelled) {
          setSellerInfo({ name: 'Продавець', avatarUrl: null })
        }
      } finally {
        if (!cancelled) {
          setLoadingSeller(false)
        }
      }
    }

    loadSellerInfo()
    return () => { cancelled = true }
  }, [isOpen, productInfo?.sellerId])

  const handleSubmit = async () => {
    if (!productInfo) return
    
    if (rating === 0) {
      setError('Будь ласка, оберіть рейтинг')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 3000)
      return
    }

    if (comment.trim().length < 10) {
      setError('Коментар повинен містити мінімум 10 символів')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 3000)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        setError('Потрібна авторизація')
        setShowErrorToast(true)
        setTimeout(() => setShowErrorToast(false), 3000)
        return
      }

      const response = await fetch(
        `https://api.sellpoint.pp.ua/api/ProductReview/AddCommentByMyId?productId=${encodeURIComponent(productInfo.productId)}&rating=${rating}&comment=${encodeURIComponent(comment.trim())}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Помилка відправки відгуку')
      }

      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
      
      // Закрываем модальное окно и вызываем callback
      setTimeout(() => {
        onClose()
        onReviewSubmitted()
      }, 1500)

    } catch (err) {
      setError('Помилка відправки відгуку')
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !productInfo) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900">Залишити відгук</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                  {productInfo.imageUrl ? (
                    <Image 
                      src={productInfo.imageUrl} 
                      alt={productInfo.productName} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-200">
                      <Image src="/window.svg" alt="Товар" width={32} height={32} className="opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                    {productInfo.productName}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {productInfo.hasDiscount ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#E53935]">
                          {(productInfo.finalPrice || productInfo.discountPrice || 0).toLocaleString('uk-UA')} грн
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          {productInfo.price.toLocaleString('uk-UA')} грн
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {productInfo.price.toLocaleString('uk-UA')} грн
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {loadingSeller ? (
                      <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
                    ) : sellerInfo?.avatarUrl ? (
                      <img 
                        src={sellerInfo.avatarUrl} 
                        alt={sellerInfo.name} 
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : null}
                    <Store className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {loadingSeller ? 'Завантаження...' : (sellerInfo?.name || 'Продавець')}
                    </span>
                  </div>
                  <Link 
                    href={`/product/${productInfo.productId}`}
                    className="inline-block mt-2 text-sm text-[#4563d1] hover:underline"
                  >
                    Переглянути товар
                  </Link>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Оцініть товар *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-gray-600">
                  {rating === 0 ? 'Оберіть рейтинг' : 
                   rating === 1 ? 'Дуже погано' :
                   rating === 2 ? 'Погано' :
                   rating === 3 ? 'Нормально' :
                   rating === 4 ? 'Добре' : 'Відмінно'}
                </span>
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Коментар *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Розкажіть про свої враження від товару..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1] transition-colors"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  Мінімум 10 символів
                </span>
                <span className="text-sm text-gray-400">
                  {comment.length}/1000
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Скасувати
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="px-6 py-2 bg-[#4563d1] text-white hover:bg-[#364ea8] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Відправка...
                </>
              ) : (
                'Залишити відгук'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-right-5 duration-300">
          <div className="flex items-center gap-3 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Відгук успішно додано!</span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-right-5 duration-300">
          <div className="flex items-center gap-3 rounded-lg bg-red-500 px-4 py-3 text-white shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}
    </>
  )
}
