import { Metadata } from 'next'
import CategoryContent from './CategoryContent'

type Props = {
  params: Promise<{
    category: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  try {
    const response = await fetch(
      `https://api.sellpoint.pp.ua/api/Category/${category}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    const categoryData = await response.json()
    
    return {
      title: `${categoryData.name.uk} | Sell Point`,
      description: `Широкий вибір товарів у категорії ${categoryData.name.uk.toLowerCase()}`
    }
  } catch {
    return {
      title: 'Категорію не знайдено | Sell Point'
    }
  }
}

export default async function CategoryPage({ params }: Props) {
  return <CategoryContent params={params} />
} 