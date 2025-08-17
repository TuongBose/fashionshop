import express from 'express'
import * as ProductController from './controllers/ProductController.js'
import * as CategoryController from './controllers/CategoryController.js'
import * as OrderController from './controllers/OrderController.js'
import * as OrderDetailController from './controllers/OrderDetailController.js'
import * as BrandController from './controllers/BrandController.js'

const router = express.Router()

export function AppRoute(app) {
    // ---------- Product ----------
    router.get('/products', ProductController.getProducts)
    router.get('/products/:id', ProductController.getProductById)
    router.post('/products', ProductController.insertProduct)
    router.put('/products/:id', ProductController.updateProduct)
    router.delete('/products/:id', ProductController.deleteProduct)

    // ---------- Category ----------
    router.get('/categories', CategoryController.getCategories)
    router.get('/categories/:id', CategoryController.getCategoryById)
    router.post('/categories', CategoryController.insertCategory)
    router.put('/categories/:id', CategoryController.updateCategory)
    router.delete('/categories/:id', CategoryController.deleteCategory)

    // ---------- Order ----------
    router.get('/orders', OrderController.getOrders)
    router.get('/orders/:id', OrderController.getOrderById)
    router.post('/orders', OrderController.insertOrder)
    router.put('/orders/:id', OrderController.updateOrder)
    router.delete('/orders/:id', OrderController.deleteOrder)

    // ---------- OrderDetail ----------
    router.get('/orderdetails', OrderDetailController.getOrderDetails)
    router.get('/orderdetails/:id', OrderDetailController.getOrderDetailById)
    router.post('/orderdetails', OrderDetailController.insertOrderDetail)
    router.put('/orderdetails/:id', OrderDetailController.updateOrderDetail)
    router.delete('/orderdetails/:id', OrderDetailController.deleteOrderDetail)

    // ---------- Brand ----------
    router.get('/brands', BrandController.getBrands)
    router.get('/brands/:id', BrandController.getBrandById)
    router.post('/brands', BrandController.insertBrand)
    router.put('/brands/:id', BrandController.updateBrand)
    router.delete('/brands/:id', BrandController.deleteBrand)

    // Mount all routes under /api
    app.use('/api', router)
}
