export async function getCategories(req, res) {
    res.status(200).json({
        message: 'Get Categories successfully'
    });
}

export async function getCategoryById(req, res) {
    res.status(200).json({
        message: 'Get Category detail successfully'
    });
}

export async function insertCategory(req, res) {
    res.status(200).json({
        message: 'Insert Category successfully'
    });
}

export async function deleteCategory(req, res) {
    res.status(200).json({
        message: 'Delete Category successfully'
    });
}

export async function updateCategory(req, res) {
    res.status(200).json({
        message: 'Update Category successfully'
    });
}
