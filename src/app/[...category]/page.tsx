import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryPageTemplate from '@/components/features/CategoryPageTemplate'

type Props = {
  params: Promise<{
    category: string[];
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categoryPath } = await params
  const categoryId = categoryPath[categoryPath.length - 1]
  
  try {
    const response = await fetch(`https://api.sellpoint.pp.ua/api/Category/${categoryId}`)
    if (!response.ok) {
      return {
        title: 'Категорію не знайдено',
      }
    }

    const category = await response.json()
    
    if (!category || !category.name) {
      return {
        title: 'Категорію не знайдено',
      }
    }
    
    const categoryName = typeof category.name === 'string' ? category.name : category.name?.uk || 'Категорія'
    
    return {
      title: `${categoryName} | Інтернет-магазин`,
      description: `Купити ${categoryName.toLowerCase()} в інтернет-магазині`,
    }
  } catch {
    return {
      title: 'Категорію не знайдено',
    }
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: categoryPath } = await params
  const categoryId = categoryPath[categoryPath.length - 1]
  
  try {
    const response = await fetch(`https://api.sellpoint.pp.ua/api/Category/${categoryId}`)
    if (!response.ok) {
      notFound()
    }

    const category = await response.json()
    
    if (!category || !category.name) {
      notFound()
    }

    const categoryName = typeof category.name === 'string' ? category.name : category.name?.uk || 'Категорія'

    return (
      <CategoryPageTemplate
        categoryId={categoryId}
        title={categoryName}
        description={`Купити ${categoryName.toLowerCase()} в інтернет-магазині`}
      />
    )
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    notFound()
  }
}