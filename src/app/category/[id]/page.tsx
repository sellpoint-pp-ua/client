import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryPageTemplate from '@/components/features/CategoryPageTemplate'

type Props = {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  
  const response = await fetch(`https://api.sellpoint.pp.ua/api/Category/${id}`)
  if (!response.ok) {
    return {
      title: 'Категорію не знайдено',
    }
  }

  const category = await response.json()
  return {
    title: `${category.name.uk} | Інтернет-магазин`,
    description: `Купити ${category.name.uk.toLowerCase()} в інтернет-магазині`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  
  
  const response = await fetch(`https://api.sellpoint.pp.ua/api/Category/${id}`)
  if (!response.ok) {
    notFound()
  }

  const category = await response.json()

  return (
    <CategoryPageTemplate
      categoryId={id}
      title={category.name.uk}
      description={`Купити ${category.name.uk.toLowerCase()} в інтернет-магазині`}
    />
  )
}