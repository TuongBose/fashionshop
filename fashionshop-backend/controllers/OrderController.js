export async function getOrders(req, res) {
    res.status(200).json({
        message: 'Get Orders successfully'
    });
}

export async function getOrderById(req, res) {
    res.status(200).json({
        message: 'Get Order detail successfully'
    });
}

export async function insertOrder(req, res) {
    res.status(200).json({
        message: 'Insert Order successfully'
    });
}

export async function updateOrder(req, res) {
    res.status(200).json({
        message: 'Update Order successfully'
    });
}

export async function deleteOrder(req, res) {
    res.status(200).json({
        message: 'Delete Order successfully'
    });
}
