export async function getProducts(req,res){
    res.status(200).json({
        message:'Get Products successfully'
    })
}

export async function getProductById(req,res){
    res.status(200).json({
        message:'Get Product detail successfully'
    })
}

export async function insertProduct(req,res){
    res.status(200).json({
        message:'Insert Product successfully'
    })
}

export async function deleteProduct(req,res){
    res.status(200).json({
        message:'Delete Product successfully'
    })
}

export async function updateProduct(req,res){
    res.status(200).json({
        message:'Update Product successfully'
    })
}