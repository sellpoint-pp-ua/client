```markdown
# Admin Panel - Features and Capabilities

## Overview

The Admin Panel provides a comprehensive set of tools for managing categories, products, and users.

## Admin Panel Pages

### 1. Categories (`/admin/categories`)

**Features:**
- ✅ View all categories in a table format
- ✅ Search categories by name or ID
- ✅ Edit categories
- ✅ Automatic search with a 300ms delay
- ✅ Backward compatibility with the old name structure

**Category Search:**
- Enter the category name to search by name
- Enter the category ID to search by ID
- Minimum search length: 2 characters
- Results are displayed in a separate block with a clear option

### 2. Products (`/admin/products`)

**Features:**
- ✅ View products by category
- ✅ Search products by name and/or category
- ✅ Filter by category via a dropdown list
- ✅ Automatic search with a 300ms delay

**Product Search:**
- Enter the product name to search by name
- Enter the category ID to filter by category
- Leave the category ID empty to search across all categories
- Combine name and category for refined searches

### 3. Users (`/admin/users`)

**Features:**
- ✅ View regular users
- ✅ Filter by roles
- ✅ Search users by name, email, or username
- ✅ User statistics
- ✅ Compact design with optimal width

### 4. Search (`/admin/search`)

**Features:**
- ✅ Universal search for categories and products
- ✅ Toggle between "Categories" and "Products" tabs
- ✅ Search by name and ID
- ✅ Detailed usage instructions

**Details:**
- Kept as a separate page for quick access
- Provides detailed information about search results
- Includes comprehensive usage instructions

## Data Structure

### Categories
New category name structure:
```typescript
{
  id: string;
  name: string; 
  parentId?: string | null;
}
```

### Products
```typescript
{
  id: string;
  name: string;
  price: number;
  categoryId?: string;
  categoryName?: string;
}
```

## API Routes

### Categories
- `GET /api/categories/full-tree` - Retrieve the full category tree
- `GET /api/categories/search` - Search categories by name
- `GET /api/categories/[id]` - Retrieve a category by ID
- `GET /api/categories/[id]/children` - Retrieve child categories
- `PUT /api/categories/update` - Update a category

### Products
- `GET /api/products/search` - Search products by name
- `GET /api/products/all` - Retrieve products with filtering
- `GET /api/products/by-category/[id]` - Retrieve products by category

### Users
- `GET /api/users/all` - Retrieve all users
- `GET /api/users/regular` - Retrieve regular users
- `POST /api/users/ban` - Ban a user
- `POST /api/users/unban` - Unban a user

## Implementation Details

### Backward Compatibility
- The `getCategoryName()` function ensures compatibility with the old name structure
- Supports both the new format (simple string) and the old format (object with languages)

### Automatic Search
- Search triggers automatically after a 300ms delay
- Minimum search length: 2 characters
- Results are displayed in real-time

### UI/UX
- Clear separation between search results and regular views
- Color coding: blue for categories, green for products
- Intuitive icons and tooltips
- "Clear" buttons to reset search results
- Sidebar stretches to full screen height
- Compact design without unnecessary navigation buttons

## Sidebar

**Features:**
- Stretches to full screen height
- Responsive design for mobile devices
- Fixed position on desktop
- Mobile burger button for collapsing/expanding
- Eliminates the need for additional navigation buttons on pages

**Navigation Links:**
- Home (`/admin`)
- Categories (`/admin/categories`)
- Products (`/admin/products`)
- Users (`/admin/users`)
- Search (`/admin/search`)
- Back to Home (in the sidebar footer)
```