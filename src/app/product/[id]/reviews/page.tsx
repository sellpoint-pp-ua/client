import ReviewPageTemplate from '@/components/features/ReviewPageTemplate'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductReviewsPage({ params }: Props) {
  const { id } = await params
  return <ReviewPageTemplate productId={id} />
}


