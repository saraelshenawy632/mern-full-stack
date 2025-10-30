# MEAN-T4
<<<<<<< HEAD
Electronics E-Commerce Website
=======

Electronics E-Commerce Website
<!-- 
GET /api/products - Get All Products

Basic Request:
GET http://localhost:3000/api/products

With Pagination:
GET http://localhost:3000/api/products?page=2&limit=5

With Filtering:
GET http://localhost:3000/api/products?category=smartphones
GET http://localhost:3000/api/products?brand=Apple
GET http://localhost:3000/api/products?minPrice=500&maxPrice=1500

With Search:
GET http://localhost:3000/api/products?search=iPhone
GET http://localhost:3000/api/products?search=gaming

With Sorting:
GET http://localhost:3000/api/products?sortBy=price&sortOrder=asc
GET http://localhost:3000/api/products?sortBy=name&sortOrder=desc

Combined Parameters:
GET http://localhost:3000/api/products?category=laptops&brand=Apple&minPrice=1000&page=1&limit=10&sortBy=price&sortOrder=asc

2. GET /api/products/:id - Get Single Product
   GET http://localhost:3000/api/products/[PRODUCT_ID]

3. POST /api/products - Create New Product

{
"name": "Test Product",
"description": "A test electronics product",
"price": 299.99,
"category": "smartphones",
"brand": "TestBrand",
"images": ["image1.jpg", "image2.jpg"],
"specifications": {
"color": "Black",
"storage": "128GB"
},
"stock": 50,
"sku": "TEST-001",
"featured": true
}

4. PUT /api/products/:id - Update Product
   {
   "name": "Updated Product Name",
   "price": 399.99,
   "stock": 25
   }

5. DELETE /api/products/:id

6. GET /api/products/categories - Get All Categories
   GET http://localhost:3000/api/products/categories

7. GET /api/products/brands - Get All Brands
   GET http://localhost:3000/api/products/brands

8. PATCH /api/products/:id/stock - Update Stock
   {
   "stock": 100,
   "operation": "set"
   }
   Increment Stock:
   {
   "stock": 10,
   "operation": "increment"
   }
   Decrement Stock:
   {
   "stock": 5,
   "operation": "decrement"
   } -->
>>>>>>> products
