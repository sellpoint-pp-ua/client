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

  const c = await response.json()
  const name: string = typeof c?.name === 'string' ? c.name : 'Категорія'
  return {
    title: `${name} | Інтернет-магазин`,
    description: `Купити ${name.toLowerCase()} в інтернет-магазині`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  
  
  const response = await fetch(`https://api.sellpoint.pp.ua/api/Category/${id}`)
  if (!response.ok) {
    notFound()
  }

  const c = await response.json()
  const name: string = typeof c?.name === 'string' ? c.name : 'Категорія'

  return (
    <CategoryPageTemplate
      categoryId={id}
      title={name}
      description={`Купити ${name.toLowerCase()} в інтернет-магазині`}
    />
  )
}