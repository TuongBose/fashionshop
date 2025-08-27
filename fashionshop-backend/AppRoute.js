import express from 'express'
import * as ProductController from './controllers/ProductController.js'
import * as CategoryController from './controllers/CategoryController.js'
import * as OrderController from './controllers/OrderController.js'
import * as OrderDetailController from './controllers/OrderDetailController.js'
import * as BrandController from './controllers/BrandController.js'
import asyncHandler from './middlewares/asyncHandler.js'
import validate from './middlewares/validate.js'
import InsertProductRequest from './dtos/requests/insertproductrequest.js'
const router = express.Router()

export function AppRoute(app) {
    // ---------- Product ----------
    router.get('/products', asyncHandler(ProductController.getProducts))
    router.get('/products/:id', asyncHandler(ProductController.getProductById))
    router.post('/products',
        validate(InsertProductRequest),
        asyncHandler(ProductController.insertProduct)
    )
    router.put('/products/:id', asyncHandler(ProductController.updateProduct))
    router.delete('/products/:id', asyncHandler(ProductController.deleteProduct))

    // ---------- Category ----------
    router.get('/categories', asyncHandler(CategoryController.getCategories))
    router.get('/categories/:id', asyncHandler(CategoryController.getCategoryById))
    router.post('/categories', asyncHandler(CategoryController.insertCategory))
    router.put('/categories/:id', asyncHandler(CategoryController.updateCategory))
    router.delete('/categories/:id', asyncHandler(CategoryController.deleteCategory))

    // ---------- Order ----------
    router.get('/orders', asyncHandler(OrderController.getOrders))
    router.get('/orders/:id', asyncHandler(OrderController.getOrderById))
    router.post('/orders', asyncHandler(OrderController.insertOrder))
    router.put('/orders/:id', asyncHandler(OrderController.updateOrder))
    router.delete('/orders/:id', asyncHandler(OrderController.deleteOrder))

    // ---------- OrderDetail ----------
    router.get('/orderdetails', asyncHandler(OrderDetailController.getOrderDetails))
    router.get('/orderdetails/:id', asyncHandler(OrderDetailController.getOrderDetailById))
    router.post('/orderdetails', asyncHandler(OrderDetailController.insertOrderDetail))
    router.put('/orderdetails/:id', asyncHandler(OrderDetailController.updateOrderDetail))
    router.delete('/orderdetails/:id', asyncHandler(OrderDetailController.deleteOrderDetail))

    // ---------- Brand ----------
    router.get('/brands', asyncHandler(BrandController.getBrands))
    router.get('/brands/:id', asyncHandler(BrandController.getBrandById))
    router.post('/brands', asyncHandler(BrandController.insertBrand))
    router.put('/brands/:id', asyncHandler(BrandController.updateBrand))
    router.delete('/brands/:id', asyncHandler(BrandController.deleteBrand))

    // Mount all routes under /api
    app.use('/api', router)
}
