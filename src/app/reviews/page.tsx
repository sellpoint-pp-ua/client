"use client"
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import AccountSidebar from '@/components/account/AccountSidebar'
import UserReviewCard from '@/components/features/UserReviewCard'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type UserReview = {
  rating: number
  comment: string
  createdAt: string
  positiveCount: number
  negativeCount: number
}

type ReviewData = {
  id: string
  productId: string
  rating: number | null
  averageRating: number
  comments: UserReview[]
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  useEffect(() => {
    const loadUserReviews = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        setLoading(false)
        setError('')
        setReviews([])
        return
      }

      try {
        setLoading(true)
        const response = await fetch('https://api.sellpoint.pp.ua/api/ProductReview/GetAllReviewsByUserId', {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          setError('')
          setReviews([])
          return
        }

        const data: ReviewData[] = await response.json()
        setReviews(Array.isArray(data) ? data : [])
        setError('')
      } catch (err) {
        setError('')
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    loadUserReviews()
  }, [])

  const handleDeleteReview = (productId: string) => {
    setDeletingProductId(productId)
    // Обновляем список отзывов, убирая удаленный
    setReviews(prevReviews => 
      prevReviews.map(reviewData => ({
        ...reviewData,
        comments: reviewData.comments.filter(comment => 
          reviewData.productId !== productId
        )
      })).filter(reviewData => reviewData.comments.length > 0)
    )
    setDeletingProductId(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto w-full max-w-[1510px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[270px] lg:flex-shrink-0">
              <AccountSidebar />
            </div>
            <div className="flex-1 -ml-2">
              <div className="rounded-xl bg-white p-3 sm:p-3 shadow-sm">
                <div className="flex items-start gap-5 flex-col">
                  <h1 className="text-lg font-bold text-gray-900">Відгуки</h1>
                  <button className="rounded-xl bg-[#4563d1]  px-5 py-2 text-sm  text-white hover:bg-[#364ea8]">
                    Про товари
                  </button>
                </div>
              </div>
              
              {/* Reviews Content */}
              {loading ? (
                <div className="mt-4 rounded-xl bg-white min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#4563d1] mx-auto mb-4"></div>
                    <p className="text-gray-500">Завантаження відгуків...</p>
                  </div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="mt-4 rounded-xl min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-6">
                      <Image
                        src="/reviews.png"
                        alt="Відгуки"
                        width={160}
                        height={160}
                        className="mx-auto"
                      />
                    </div>
                    
                    <h2 className="text-[18px] font-bold text-gray-900 mb-2">
                      Тут будуть твої відгуки про продавців
                    </h2>
                    
                    <p className="text-gray-900 text-[14px] mb-4 max-w-[300px] mx-auto">
                      Замовляй на sellpoint.ua та ділись своїм досвідом з іншими покупцями
                    </p>
                    
                    <Link 
                      href="/" 
                      className="inline-flex rounded-xl bg-[#4563d1] px-5 py-2 text-sm text-white hover:bg-[#364ea8] transition-colors"
                    >
                      Перейти до покупки
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((reviewData) => 
                    reviewData.comments.map((review, index) => (
                      <UserReviewCard
                        key={`${reviewData.id}-${index}`}
                        productId={reviewData.productId}
                        review={review}
                        onDelete={handleDeleteReview}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
