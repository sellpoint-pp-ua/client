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
  const categoryName = typeof category.name === 'string' ? category.name : category.name?.uk || 'Категорія'
  return {
    title: `${categoryName} | Інтернет-магазин`,
    description: `Купити ${categoryName.toLowerCase()} в інтернет-магазині`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  
  
  const response = await fetch(`https://api.sellpoint.pp.ua/api/Category/${id}`)
  if (!response.ok) {
    notFound()
  }

  const category = await response.json()
  const categoryName = typeof category.name === 'string' ? category.name : category.name?.uk || 'Категорія'

  return (
    <CategoryPageTemplate
      categoryId={id}
      title={categoryName}
      description={`Купити ${categoryName.toLowerCase()} в інтернет-магазині`}
    />
  )
}