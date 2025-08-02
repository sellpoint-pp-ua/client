import { Metadata } from 'next'
import CategoryContent from '../../[category]/CategoryContent'

export const metadata: Metadata = {
  title: 'Догляд за обличчям | Sell Point',
  description: 'Професійні засоби для догляду за обличчям',
}

// Use the category ID for "Догляд за обличчям"
const CATEGORY_ID = '687e7fef3f410756d06e04f6'

export default function FacialCarePage() {
  return <CategoryContent params={Promise.resolve({ category: CATEGORY_ID })} />
} 