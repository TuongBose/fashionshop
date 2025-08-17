export async function getBrands(req, res) {
    res.status(200).json({
        message: 'Get Brands successfully'
    });
}

export async function getBrandById(req, res) {
    res.status(200).json({
        message: 'Get Brand detail successfully'
    });
}

export async function insertBrand(req, res) {
    res.status(200).json({
        message: 'Insert Brand successfully'
    });
}

export async function updateBrand(req, res) {
    res.status(200).json({
        message: 'Update Brand successfully'
    });
}

export async function deleteBrand(req, res) {
    res.status(200).json({
        message: 'Delete Brand successfully'
    });
}
