import express from'express'
import * as ProductController from './controllers/ProductController'

const router=express.Router()

export function AppRoute(app){
    // http://localhost:3000/products
    router.get('/products',ProductController.getProducts);
    router.get('/products/:id',ProductController.getProductById);
    router.post('/products',ProductController.insertProduct);
    router.put('/products/:id',ProductController.updateProduct);
    router.delete('/products/:id',ProductController.deleteProduct);

    app.use('/api/',router);
}