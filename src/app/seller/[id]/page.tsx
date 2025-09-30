import SellerPageTemplate from '@/components/features/SellerPageTemplate'

interface SellerPageProps {
  // Match Next.js PageProps: params typed as a Promise of segment params
  params?: Promise<{ id: string }>
}

// Default seller data - will be updated from API
const defaultSellerInfo = {
  id: '',
  name: 'Завантаження...',
  displayName: 'Завантаження...',
  avatar: undefined,
  rating: 0,
  positiveReviews: 0,
  totalReviews: 0,
  isVerified: false
}

export default async function SellerPage({ params }: SellerPageProps) {
  // params can be a plain object or a Promise — awaiting is safe either way
  const resolvedParams = await params
  const sellerId = resolvedParams?.id ?? ''

  return (
    <SellerPageTemplate 
      sellerId={sellerId}
      sellerInfo={defaultSellerInfo}
    />
  )
}
