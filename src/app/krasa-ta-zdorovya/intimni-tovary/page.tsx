import { Metadata } from 'next'
import CategoryContent from '../[category]/CategoryContent'

export const metadata: Metadata = {
  title: 'Інтимні товари | Sell Point',
  description: 'Широкий вибір інтимних товарів',
}

// Use the category ID for "Інтимні товари"
const CATEGORY_ID = '687e7fc93f410756d06e04f4'

export default function IntimateProductsPage() {
  return <CategoryContent params={Promise.resolve({ category: CATEGORY_ID })} />
} 