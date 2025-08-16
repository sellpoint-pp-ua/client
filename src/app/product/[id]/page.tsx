import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductPageTemplate from '@/components/features/ProductPageTemplate'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const res = await fetch(`https://api.sellpoint.pp.ua/api/Product/get-by-id/${id}`, { next: { revalidate: 300 } })
    if (!res.ok) return { title: 'Товар не знайдено' }
    const product = await res.json()
    const title = typeof product.name === 'string' ? product.name : 'Товар'
    return { title: `${title} | Інтернет-магазин` }
  } catch {
    return { title: 'Товар' }
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  if (!id) notFound()
  return <ProductPageTemplate productId={id} />
}


