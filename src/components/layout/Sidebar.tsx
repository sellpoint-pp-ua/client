'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Category } from '@/types/category'

type MenuItem = {
  id: string;
  name: string;
  slug: string;
  children?: MenuItem[];
}

// Define the mapping between API categories and our actual pages
const CATEGORY_MAPPING: CategoryMappingType = {
  'Краса та здоров\'я': {
    path: '/krasa-ta-zdorovya',
    subcategories: {
      'Косметика по догляду': {
        path: '/krasa-ta-zdorovya/kosmetyka-po-doglyadu',
        subcategories: {
          'Догляд за обличчям': '/krasa-ta-zdorovya/kosmetyka-po-doglyadu/doglyad-za-oblychchyam',
          'Догляд за волоссям': '/krasa-ta-zdorovya/kosmetyka-po-doglyadu/doglyad-za-volosyam'
        }
      },
      'Все для манікюру і педикюру': '/krasa-ta-zdorovya/manikur-pedikur',
      'Інтимні товари': '/krasa-ta-zdorovya/intimni-tovary'
    }
  },
  'Дім і сад': {
    path: '/dim-i-sad',
    subcategories: {}
  }
};

// Update the type to match our new structure
type CategoryMappingType = {
  [key: string]: {
    path: string;
    subcategories: {
      [key: string]: string | {
        path: string;
        subcategories: {
          [key: string]: string;
        };
      };
    };
  };
};

function mapCategoryToMenuItem(category: Category): MenuItem {
  const slug = category.name.uk
    .toLowerCase()
    .trim()
    .replace(/[']/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    id: category.id,
    name: category.name.uk,
    slug,
    children: category.children?.map(mapCategoryToMenuItem)
  };
}

function getCategoryUrl(category: MenuItem, parentCategory?: MenuItem, grandparentCategory?: MenuItem): string {
  // For third-level categories (sub-subcategories)
  if (grandparentCategory && parentCategory) {
    // Find the main category mapping
    const mainCategoryInfo = CATEGORY_MAPPING[grandparentCategory.name];
    if (!mainCategoryInfo) {
      console.warn(`Could not find main category: ${grandparentCategory.name}`);
      return '/';
    }

    // Find the second-level category (parent) mapping
    const subcategoryInfo = mainCategoryInfo.subcategories[parentCategory.name];
    if (typeof subcategoryInfo === 'object' && subcategoryInfo.subcategories) {
      // Find the third-level category mapping
      const thirdLevelPath = subcategoryInfo.subcategories[category.name];
      if (thirdLevelPath) {
        return thirdLevelPath;
      }
    }
    // Fallback to slug-based URL
    return `${mainCategoryInfo.path}/${parentCategory.slug}/${category.slug}`;
  }

  // For second-level categories
  if (parentCategory) {
    const mainCategoryInfo = CATEGORY_MAPPING[parentCategory.name];
    if (!mainCategoryInfo) {
      console.warn(`Could not find main category: ${parentCategory.name}`);
      return '/';
    }

    const subcategoryInfo = mainCategoryInfo.subcategories[category.name];
    if (typeof subcategoryInfo === 'string') {
      return subcategoryInfo;
    } else if (subcategoryInfo && typeof subcategoryInfo === 'object') {
      return subcategoryInfo.path;
    }
    // Fallback to slug-based URL
    return `${mainCategoryInfo.path}/${category.slug}`;
  }

  // For main categories
  const mainCategoryInfo = CATEGORY_MAPPING[category.name];
  if (mainCategoryInfo) {
    return mainCategoryInfo.path;
  }
  console.warn(`Unknown main category: ${category.name}`);
  return '/';
}

export default function Sidebar() {
  const [categories, setCategories] = useState<MenuItem[]>([])
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/categories/full-tree')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        const menuItems = data.map(mapCategoryToMenuItem)
        setCategories(menuItems)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <aside className="relative w-[250px] bg-white p-4 rounded-lg">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </aside>
    )
  }

  if (error || !categories.length) {
    return (
      <aside className="relative w-[250px] bg-white p-4 rounded-lg">
        <p className="text-gray-500 text-sm">Categories not found</p>
      </aside>
    )
  }

  return (
    <aside className="relative w-[250px] bg-white p-4 rounded-lg">
      <nav className="space-y-1">
        {categories.map((category) => {
          const categoryPath = getCategoryUrl(category);
          return (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link
                href={categoryPath}
                className="text-sm flex items-center justify-between rounded-lg px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#7B1FA2]"
              >
                <span>{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Link>

              {hoveredCategory === category.id && category.children && category.children.length > 0 && (
                <div className="absolute left-full top-0 z-50 ml-0 w-[400px] rounded-lg bg-white p-4 shadow-lg">
                  <div className="space-y-6">
                    {category.children.map((subcategory) => {
                      const subcategoryPath = getCategoryUrl(subcategory, category);
                      return (
                        <div key={subcategory.id}>
                          <h3 className="mb-2 font-medium text-gray-900">
                            <Link href={subcategoryPath} className="hover:text-[#7B1FA2]">
                              {subcategory.name}
                            </Link>
                          </h3>
                          {subcategory.children && subcategory.children.length > 0 && (
                            <ul className="space-y-2">
                              {subcategory.children.map((item) => {
                                const itemPath = getCategoryUrl(item, subcategory, category);
                                return (
                                  <li key={item.id}>
                                    <Link
                                      href={itemPath}
                                      className="text-sm text-gray-600 hover:text-[#7B1FA2]"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  )
} 