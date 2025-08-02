import { Metadata } from 'next'
import CategoryContent from '../[category]/CategoryContent'

export const metadata: Metadata = {
  title: 'Все для манікюру і педикюру | Sell Point',
  description: 'Широкий вибір товарів для манікюру та педикюру',
}

// Use the category ID for "Все для манікюру і педикюру"
const CATEGORY_ID = '687e7fb83f410756d06e04f2'

export default function ManicurePedicurePage() {
  return <CategoryContent params={Promise.resolve({ category: CATEGORY_ID })} />
} 