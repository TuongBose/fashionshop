import express from 'express'
import * as ProductController from './controllers/ProductController.js'
import * as CategoryController from './controllers/CategoryController.js'
import * as OrderController from './controllers/OrderController.js'
import * as OrderDetailController from './controllers/OrderDetailController.js'
import * as BrandController from './controllers/BrandController.js'
import * as UserController from './controllers/UserController.js'
import * as NewsController from './controllers/NewsController.js'
import * as NewsDetailController from './controllers/NewsDetailController.js'
import * as BannerController from './controllers/BannerController.js'
import * as BannerDetailController from './controllers/BannerDetailController.js'
import * as ImageController from './controllers/ImageController.js'
import asyncHandler from './middlewares/asyncHandler.js'
import validate from './middlewares/validate.js'
import UpdateProductRequest from './dtos/requests/product/UpdateProductRequest.js'
import InsertProductRequest from './dtos/requests/product/InsertProductRequest.js'
import InsertOrderRequest from './dtos/requests/order/InsertOrderRequest.js'
import InsertUserRequest from './dtos/requests/user/InsertUserRequest.js'
import InsertNewsRequest from './dtos/requests/news/InsertNewsRequest.js'
import InsertNewsDetailRequest from './dtos/requests/newsdetail/InsertNewsDetailRequest.js'
import UpdateNewsRequest from './dtos/requests/news/UpdateNewsRequest.js'
import InsertBannerRequest from './dtos/requests/bannner/InsertBannerRequest.js'
import InsertBannerDetailRequest from './dtos/requests/banner_detail/InsertBannerDetailRequest.js'
import uploadImageMiddleware from './middlewares/imageUpload.js'
import validateImageExists from './middlewares/validateImageExists.js'
import uploadGoogleImageMiddleware from './middlewares/imageGoogleUpload.js'

const router = express.Router()

export function AppRoute(app) {
    // ---------- User ----------
    router.post('/users',
        validate(InsertUserRequest),
        asyncHandler(UserController.insertUser))

    // ---------- Product ----------
    router.get('/products', asyncHandler(ProductController.getProducts))
    router.get('/products/:id', asyncHandler(ProductController.getProductById))
    router.post('/products',
        validate(InsertProductRequest),
        validateImageExists,
        asyncHandler(ProductController.insertProduct)
    )
    router.put('/products/:id',
        validate(UpdateProductRequest),
        validateImageExists,
        asyncHandler(ProductController.updateProduct))
    router.delete('/products/:id', asyncHandler(ProductController.deleteProduct))

    // ---------- Category ----------
    router.get('/categories', asyncHandler(CategoryController.getCategories))
    router.get('/categories/:id', asyncHandler(CategoryController.getCategoryById))
    router.post('/categories',
        validateImageExists,
        asyncHandler(CategoryController.insertCategory))
    router.put('/categories/:id',
        validateImageExists,
        asyncHandler(CategoryController.updateCategory))
    router.delete('/categories/:id', asyncHandler(CategoryController.deleteCategory))

    // ---------- Order ----------
    router.get('/orders', asyncHandler(OrderController.getOrders))
    router.get('/orders/:id', asyncHandler(OrderController.getOrderById))
    router.post('/orders',
        validate(InsertOrderRequest),
        asyncHandler(OrderController.insertOrder))
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
    router.post('/brands',
        validateImageExists,
        asyncHandler(BrandController.insertBrand))
    router.put('/brands/:id',
        validateImageExists, 
        asyncHandler(BrandController.updateBrand))
    router.delete('/brands/:id', asyncHandler(BrandController.deleteBrand))

    // ---------- News ----------
    router.get('/news', asyncHandler(NewsController.getNewsArticle))
    router.get('/news/:id', asyncHandler(NewsController.getNewsArticleById))
    router.post('/news',
        validate(InsertNewsRequest),
        validateImageExists,
        asyncHandler(NewsController.insertNewsArticle))
    router.put('/news/:id',
        validate(UpdateNewsRequest),
        validateImageExists,
        asyncHandler(NewsController.updateNewsArticle))
    router.delete('/news/:id', asyncHandler(NewsController.deleteNewsArticle))

    // ---------- NewsDetails ----------
    router.get('/news-details', asyncHandler(NewsDetailController.getNewsDetails))
    router.get('/news-details/:id', asyncHandler(NewsDetailController.getNewsDetailById))
    router.post('/news-details', asyncHandler(NewsDetailController.insertNewsDetail))
    router.put('/news-details/:id',
        validate(InsertNewsDetailRequest),
        asyncHandler(NewsDetailController.updateNewsDetail))
    router.delete('/news-details/:id', asyncHandler(NewsDetailController.deleteNewsDetail))

    // ---------- Banner ----------
    router.get('/banners', asyncHandler(BannerController.getBanners))
    router.get('/banners/:id', asyncHandler(BannerController.getBannerById))
    router.post('/banners',
        validate(InsertBannerRequest),
        validateImageExists,
        asyncHandler(BannerController.insertBanner)
    )
    router.put('/banners/:id',
        validateImageExists,
        asyncHandler(BannerController.updateBanner))
    router.delete('/banners/:id', asyncHandler(BannerController.deleteBanner))

    // ---------- BannerDetails ----------
    router.get('/banner-details', asyncHandler(BannerDetailController.getBannerDetails))
    router.get('/banner-details/:id', asyncHandler(BannerDetailController.getBannerDetailById))
    router.post('/banner-details',
        validate(InsertBannerDetailRequest),
        asyncHandler(BannerDetailController.insertBannerDetail)
    )
    router.put('/banner-details/:id',
        asyncHandler(BannerDetailController.updateBannerDetail)
    )
    router.delete('/banner-details/:id', asyncHandler(BannerDetailController.deleteBannerDetail))

    // ---------- Images ----------
    router.post('/images/upload',
        uploadImageMiddleware.array('images', 5),
        asyncHandler(ImageController.uploadImages)
    )
    router.post('/images/google/upload',
        uploadGoogleImageMiddleware.single('images'),
        asyncHandler(ImageController.uploadImageToGoogleStorage)
    )
    router.get('/images/:fileName', asyncHandler(ImageController.getImages)
    )

    // Mount all routes under /api
    app.use('/api', router)
}
