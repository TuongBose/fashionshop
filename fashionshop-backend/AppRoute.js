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
import * as ProductImageController from './controllers/ProductImageController.js'
import * as CartController from './controllers/CartController.js'
import * as CartItemController from './controllers/CartItemController.js'

import asyncHandler from './middlewares/asyncHandler.js'
import validate from './middlewares/validate.js'
import UpdateProductRequest from './dtos/requests/product/UpdateProductRequest.js'
import InsertProductRequest from './dtos/requests/product/InsertProductRequest.js'
import InsertOrderRequest from './dtos/requests/order/InsertOrderRequest.js'
import InsertUserRequest from './dtos/requests/user/InsertUserRequest.js'
import LoginUserRequest from './dtos/requests/user/LoginUserRequest.js'
import InsertNewsRequest from './dtos/requests/news/InsertNewsRequest.js'
import InsertNewsDetailRequest from './dtos/requests/newsdetail/InsertNewsDetailRequest.js'
import UpdateNewsRequest from './dtos/requests/news/UpdateNewsRequest.js'
import InsertBannerRequest from './dtos/requests/bannner/InsertBannerRequest.js'
import InsertBannerDetailRequest from './dtos/requests/banner_detail/InsertBannerDetailRequest.js'
import uploadImageMiddleware from './middlewares/imageUpload.js'
import validateImageExists from './middlewares/validateImageExists.js'
import uploadGoogleImageMiddleware from './middlewares/imageGoogleUpload.js'
import InsertProductImageRequest from './dtos/requests/product_images/InsertProductImageRequest.js'
import InsertCartRequest from './dtos/requests/cart/InsertCartRequest.js'
import InsertCartItemRequest from './dtos/requests/cart_item/InsertCartItemRequest.js'
import UpdateOrderRequest from './dtos/requests/order/UpdateOrderRequest.js'

import { requireRoles } from './middlewares/jwtMiddleware.js'
import UserRole from './constants/UserRole.js'

const router = express.Router()

export function AppRoute(app) {
    // ---------- User ----------
    router.post('/users/register',
        validate(InsertUserRequest),
        asyncHandler(UserController.registerUser))
    router.post('/users/login',
        validate(LoginUserRequest),
        asyncHandler(UserController.loginUser))
    router.put('/users/:id',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        asyncHandler(UserController.updateUser))

    // ---------- Product ----------
    router.get('/products', asyncHandler(ProductController.getProducts))
    router.get('/products/:id', asyncHandler(ProductController.getProductById))
    router.post('/products',
        requireRoles([UserRole.ADMIN]),
        validate(InsertProductRequest),
        validateImageExists,
        asyncHandler(ProductController.insertProduct)
    )
    router.put('/products/:id',
        requireRoles([UserRole.ADMIN]),
        validate(UpdateProductRequest),
        validateImageExists,
        asyncHandler(ProductController.updateProduct))
    router.delete('/products/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(ProductController.deleteProduct))

    // ---------- Category ----------
    router.get('/categories', asyncHandler(CategoryController.getCategories))
    router.get('/categories/:id', asyncHandler(CategoryController.getCategoryById))
    router.post('/categories',
        requireRoles([UserRole.ADMIN]),
        validateImageExists,
        asyncHandler(CategoryController.insertCategory))
    router.put('/categories/:id',
        requireRoles([UserRole.ADMIN]),
        validateImageExists,
        asyncHandler(CategoryController.updateCategory))
    router.delete('/categories/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(CategoryController.deleteCategory))

    // ---------- Order ----------
    router.get('/orders', asyncHandler(OrderController.getOrders))
    router.get('/orders/:id', asyncHandler(OrderController.getOrderById))
    router.post('/orders',
        validate(InsertOrderRequest),
        asyncHandler(OrderController.insertOrder))
    router.put('/orders/:id',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        validate(UpdateOrderRequest),
        asyncHandler(OrderController.updateOrder))
    router.delete('/orders/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(OrderController.deleteOrder))

    // ---------- OrderDetail ----------
    router.get('/orderdetails', asyncHandler(OrderDetailController.getOrderDetails))
    router.get('/orderdetails/:id', asyncHandler(OrderDetailController.getOrderDetailById))
    router.post('/orderdetails',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(OrderDetailController.insertOrderDetail))
    router.put('/orderdetails/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(OrderDetailController.updateOrderDetail))
    router.delete('/orderdetails/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(OrderDetailController.deleteOrderDetail))

    // ---------- Cart ----------
    router.get('/carts', asyncHandler(CartController.getCarts))
    router.get('/carts/:id', asyncHandler(CartController.getCartById))
    router.post('/carts',
        validate(InsertCartRequest),
        asyncHandler(CartController.insertCart))
    router.post('/carts/checkout', asyncHandler(CartController.checkoutCart))
    router.delete('/carts/:id',
        requireRoles([UserRole.USER]),
        asyncHandler(CartController.deleteCart))

    // ---------- Cart Item ----------
    router.get('/cart-items', asyncHandler(CartItemController.getCartItems))
    router.get('/cart-items/:id', asyncHandler(CartItemController.getCartItemById))
    router.get('/cart-items/cart/:cart_id', asyncHandler(CartItemController.getCartItemByCartId))
    router.post('/cart-items',
        requireRoles([UserRole.USER]),
        validate(InsertCartItemRequest),
        asyncHandler(CartItemController.insertCartItem))
    router.delete('/cart-items/:id',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        asyncHandler(CartItemController.deleteCartItem))
    router.put('/cart-items/:id',
        requireRoles([UserRole.USER]),
        asyncHandler(CartItemController.updateCartItem))

    // ---------- Brand ----------
    router.get('/brands', asyncHandler(BrandController.getBrands))
    router.get('/brands/:id', asyncHandler(BrandController.getBrandById))
    router.post('/brands',
        requireRoles([UserRole.ADMIN]),
        validateImageExists,
        asyncHandler(BrandController.insertBrand))
    router.put('/brands/:id',
        requireRoles([UserRole.ADMIN]),
        validateImageExists,
        asyncHandler(BrandController.updateBrand))
    router.delete('/brands/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(BrandController.deleteBrand))

    // ---------- News ----------
    router.get('/news', asyncHandler(NewsController.getNewsArticle))
    router.get('/news/:id', asyncHandler(NewsController.getNewsArticleById))
    router.post('/news',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        validate(InsertNewsRequest),
        validateImageExists,
        asyncHandler(NewsController.insertNewsArticle))
    router.put('/news/:id',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        validate(UpdateNewsRequest),
        validateImageExists,
        asyncHandler(NewsController.updateNewsArticle))
    router.delete('/news/:id',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        asyncHandler(NewsController.deleteNewsArticle))

    // ---------- NewsDetails ----------
    router.get('/news-details', asyncHandler(NewsDetailController.getNewsDetails))
    router.get('/news-details/:id', asyncHandler(NewsDetailController.getNewsDetailById))
    router.post('/news-details',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        asyncHandler(NewsDetailController.insertNewsDetail))
    router.put('/news-details/:id',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        validate(InsertNewsDetailRequest),
        asyncHandler(NewsDetailController.updateNewsDetail))
    router.delete('/news-details/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(NewsDetailController.deleteNewsDetail))

    // ---------- Banner ----------
    router.get('/banners', asyncHandler(BannerController.getBanners))
    router.get('/banners/:id', asyncHandler(BannerController.getBannerById))
    router.post('/banners',
        requireRoles([UserRole.ADMIN]),
        validate(InsertBannerRequest),
        validateImageExists,
        asyncHandler(BannerController.insertBanner)
    )
    router.put('/banners/:id',
        requireRoles([UserRole.ADMIN]),
        validateImageExists,
        asyncHandler(BannerController.updateBanner))
    router.delete('/banners/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(BannerController.deleteBanner))

    // ---------- BannerDetails ----------
    router.get('/banner-details', asyncHandler(BannerDetailController.getBannerDetails))
    router.get('/banner-details/:id', asyncHandler(BannerDetailController.getBannerDetailById))
    router.post('/banner-details',
        requireRoles([UserRole.ADMIN]),
        validate(InsertBannerDetailRequest),
        asyncHandler(BannerDetailController.insertBannerDetail)
    )
    router.put('/banner-details/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(BannerDetailController.updateBannerDetail)
    )
    router.delete('/banner-details/:id',
        requireRoles([UserRole.ADMIN]),
        asyncHandler(BannerDetailController.deleteBannerDetail))

    // ---------- Images ----------
    router.post('/images/upload',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        uploadImageMiddleware.array('images', 5),
        asyncHandler(ImageController.uploadImages)
    )
    router.post('/images/google/upload',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        uploadGoogleImageMiddleware.single('images'),
        asyncHandler(ImageController.uploadImageToGoogleStorage)
    )
    router.delete('/images/delete',
        requireRoles([UserRole.ADMIN, UserRole.USER]),
        ImageController.deleteImage)
    router.get('/images/:fileName', asyncHandler(ImageController.getImages)
    )

    // ---------- Product Image ----------
    router.get('/product-images', asyncHandler(ProductImageController.getProductImages))
    router.get('/product-images/:id', asyncHandler(ProductImageController.getProductImageById))
    router.post('/product-images',
        requireRoles([UserRole.ADMIN]),
        validate(InsertProductImageRequest),
        asyncHandler(ProductImageController.insertProductImage))
    router.put('/product-images/:id', asyncHandler(ProductImageController.updateProductImage))
    router.delete('/product-images/:id', asyncHandler(ProductImageController.deleteProductImage))

    // Mount all routes under /api
    app.use('/api', router)
}
