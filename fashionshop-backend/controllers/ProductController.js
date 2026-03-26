import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models"

export async function getProducts(req, res) {
  // const products = await db.Product.findAll(); // Phai phan trang

  const { search = '', page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};
  if (search.trim() !== '') {
    whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { specification: { [Op.like]: `%${search}%` } }
      ]
    };
  }

  const [products, totalProducts] = await Promise.all([
    db.Product.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),
    db.Product.count({
      where: whereClause,
    })
  ]);

  return res.status(200).json({
    message: 'Get Products successfully',
    data: products,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalProducts / pageSize),
    totalProducts,
  })
}

export async function getProductById(req, res) {
  const productId = req.params.id; // Cách 1: Lấy tham số id truyền vào từ params
  const { id } = req.params;       // Cách 2: tìm trong params có trường id thì lấy giá trị của nó 
  const product = await db.Product.findByPk(id);
  if (!product) {
    // If not found product, return a 404 Not Found response
    return res.status(400).json({
      message: 'Product does not exists'
    })
  }
  res.status(200).json({
    message: 'Get Product detail successfully',
    data: product
  })
}

export async function insertProduct(req, res) {
  // const { error } = InsertProductRequest.validate(req.body) // destructuring an object
  // if (error) {
  //     return res.status(400).json({
  //         message: 'Insert Product failed',
  //         // errors: error.details
  //         error: error.details[0]?.message
  //     });
  // }

  const product = await db.Product.create(req.body);
  return res.status(201).json({
    message: 'Insert Product successfully',
    data: product
  })
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  const deleted = await db.Product.destroy({
    where: { id }
  });
  if (deleted) {
    return res.status(200).json({
      message: 'Delete product successfully'
    })
  } else {
    res.status(404).json({
      message: 'Product not found'
    })
  }
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const updatedProduct = await db.Product.update(req.body, {
    where: { id }
  });
  if (updatedProduct[0] > 0) {
    res.status(200).json({
      message: 'Update product successfully'
    })
  } else {
    res.status(404).json({
      message: 'Product not found'
    })
  }
}

/*
  {
    "name": "iPhone 14 Pro Max",
    "price": 29990000,
    "oldprice": 32990000,
    "image": "",
    "description": "iPhone 14 Pro Max với chip A16 Bionic, camera 48MP và thiết kế cao cấp.",
    "specification": "Màn hình OLED 6.7 inch; Chip A16; RAM 6GB; Bộ nhớ 256GB; Camera 48MP; Pin 4323mAh.",
    "buyturn": 500,
    "quantity": 40,
    "brand_id": 1,
    "category_id": 3
  },
  {
    "name": "Samsung Galaxy S23",
    "price": 22990000,
    "oldprice": 25990000,
    "image": "",
    "description": "Galaxy S23 hiệu năng mạnh mẽ với Snapdragon 8 Gen 2.",
    "specification": "Màn hình AMOLED 6.1 inch; RAM 8GB; Bộ nhớ 256GB; Camera 50MP; Pin 3900mAh.",
    "buyturn": 320,
    "quantity": 60,
    "brand_id": 1,
    "category_id": 3
  },
  {
    "name": "Áo khoác bomber nam",
    "price": 499000,
    "oldprice": 650000,
    "image": "",
    "description": "Áo khoác bomber thời trang, phù hợp đi chơi và dạo phố.",
    "specification": "Chất liệu: Polyester; Màu: Đen, Xanh; Size: M, L, XL.",
    "buyturn": 150,
    "quantity": 70,
    "brand_id": 2,
    "category_id": 1
  },
  {
    "name": "Quần short thể thao",
    "price": 199000,
    "oldprice": 250000,
    "image": "",
    "description": "Quần short thoáng mát, thích hợp tập gym và chạy bộ.",
    "specification": "Chất liệu: Cotton; Màu: Đen, Xám; Size: S, M, L.",
    "buyturn": 210,
    "quantity": 90,
    "brand_id": 2,
    "category_id": 2
  },
  {
    "name": "Giày thể thao Nike Air",
    "price": 1890000,
    "oldprice": 2200000,
    "image": "",
    "description": "Giày Nike Air nhẹ, êm ái, phù hợp chạy bộ.",
    "specification": "Chất liệu: Vải + Cao su; Size: 38-44.",
    "buyturn": 430,
    "quantity": 55,
    "brand_id": 3,
    "category_id": 4
  },
  {
    "name": "Túi xách nữ cao cấp",
    "price": 899000,
    "oldprice": 1200000,
    "image": "",
    "description": "Túi xách nữ thiết kế sang trọng, phù hợp đi làm.",
    "specification": "Chất liệu: Da PU; Màu: Nâu, Đen.",
    "buyturn": 180,
    "quantity": 35,
    "brand_id": 4,
    "category_id": 5
  },
  {
    "name": "Áo hoodie unisex",
    "price": 399000,
    "oldprice": 500000,
    "image": "",
    "description": "Áo hoodie phong cách streetwear, giữ ấm tốt.",
    "specification": "Chất liệu: Nỉ; Màu: Đen, Trắng; Size: M, L, XL.",
    "buyturn": 260,
    "quantity": 80,
    "brand_id": 2,
    "category_id": 1
  },
  {
    "name": "Laptop Dell XPS 13",
    "price": 25990000,
    "oldprice": 28990000,
    "image": "",
    "description": "Laptop mỏng nhẹ, hiệu năng mạnh mẽ cho công việc.",
    "specification": "CPU Intel i7; RAM 16GB; SSD 512GB; Màn hình 13.4 inch.",
    "buyturn": 120,
    "quantity": 20,
    "brand_id": 5,
    "category_id": 6
  },
  {
    "name": "Đồng hồ thông minh Apple Watch",
    "price": 9990000,
    "oldprice": 11990000,
    "image": "",
    "description": "Smartwatch theo dõi sức khỏe và hoạt động thể thao.",
    "specification": "Màn hình OLED; Pin 18h; Chống nước.",
    "buyturn": 300,
    "quantity": 45,
    "brand_id": 1,
    "category_id": 7
  },
  {
    "name": "Áo sơ mi trắng công sở",
    "price": 299000,
    "oldprice": 400000,
    "image": "",
    "description": "Áo sơ mi lịch sự, phù hợp môi trường công sở.",
    "specification": "Chất liệu: Cotton; Size: M, L, XL.",
    "buyturn": 190,
    "quantity": 65,
    "brand_id": 2,
    "category_id": 1
  },
  {
    "name": "Quần jeans rách nữ",
    "price": 459000,
    "oldprice": 550000,
    "image": "",
    "description": "Quần jeans cá tính, phong cách trẻ trung.",
    "specification": "Chất liệu: Denim; Size: S, M, L.",
    "buyturn": 220,
    "quantity": 50,
    "brand_id": 2,
    "category_id": 2
  },
  {
    "name": "Balo du lịch đa năng",
    "price": 599000,
    "oldprice": 750000,
    "image": "",
    "description": "Balo rộng rãi, phù hợp đi học và du lịch.",
    "specification": "Chất liệu: Vải chống nước; Dung tích: 25L.",
    "buyturn": 275,
    "quantity": 60,
    "brand_id": 4,
    "category_id": 5
  },
  {
    "name": "Áo thun oversize nữ",
    "price": 249000,
    "oldprice": 320000,
    "image": "",
    "description": "Áo thun oversize phong cách Hàn Quốc, trẻ trung năng động.",
    "specification": "Chất liệu: Cotton 100%; Màu: Trắng, Đen, Be; Size: Freesize.",
    "buyturn": 210,
    "quantity": 75,
    "brand_id": 2,
    "category_id": 1
  },
  {
    "name": "Giày Adidas Ultraboost",
    "price": 3290000,
    "oldprice": 3900000,
    "image": "",
    "description": "Giày chạy bộ cao cấp với đế Boost êm ái.",
    "specification": "Chất liệu: Primeknit; Size: 38-44; Công nghệ Boost.",
    "buyturn": 340,
    "quantity": 45,
    "brand_id": 3,
    "category_id": 4
  },
  {
    "name": "Quần tây nam công sở",
    "price": 399000,
    "oldprice": 500000,
    "image": "",
    "description": "Quần tây lịch lãm, phù hợp đi làm và sự kiện.",
    "specification": "Chất liệu: Polyester; Màu: Đen, Xám; Size: M, L, XL.",
    "buyturn": 160,
    "quantity": 55,
    "brand_id": 2,
    "category_id": 2
  },
  {
    "name": "Túi đeo chéo nam",
    "price": 299000,
    "oldprice": 380000,
    "image": "",
    "description": "Túi đeo chéo nhỏ gọn, tiện lợi khi di chuyển.",
    "specification": "Chất liệu: Vải dù; Màu: Đen, Xanh.",
    "buyturn": 190,
    "quantity": 60,
    "brand_id": 4,
    "category_id": 5
  },
  {
    "name": "Laptop MacBook Air M2",
    "price": 27990000,
    "oldprice": 30990000,
    "image": "",
    "description": "MacBook Air M2 thiết kế mỏng nhẹ, hiệu năng cao.",
    "specification": "Chip Apple M2; RAM 8GB; SSD 256GB; Màn hình 13.6 inch.",
    "buyturn": 140,
    "quantity": 25,
    "brand_id": 5,
    "category_id": 6
  },
  {
    "name": "Áo len cổ lọ mùa đông",
    "price": 359000,
    "oldprice": 450000,
    "image": "",
    "description": "Áo len giữ ấm tốt, thiết kế thời trang.",
    "specification": "Chất liệu: Len; Màu: Nâu, Be; Size: M, L.",
    "buyturn": 130,
    "quantity": 40,
    "brand_id": 2,
    "category_id": 1
  },
  {
    "name": "Giày cao gót nữ",
    "price": 499000,
    "oldprice": 650000,
    "image": "",
    "description": "Giày cao gót thanh lịch, phù hợp dự tiệc.",
    "specification": "Chất liệu: Da PU; Chiều cao: 7cm; Size: 35-39.",
    "buyturn": 175,
    "quantity": 30,
    "brand_id": 3,
    "category_id": 4
  },
  {
    "name": "Balo laptop chống sốc",
    "price": 699000,
    "oldprice": 850000,
    "image": "",
    "description": "Balo chống sốc bảo vệ laptop an toàn.",
    "specification": "Chất liệu: Polyester chống nước; Ngăn laptop 15.6 inch.",
    "buyturn": 220,
    "quantity": 50,
    "brand_id": 4,
    "category_id": 5
  },
  {
    "name": "Tai nghe Bluetooth Sony",
    "price": 2190000,
    "oldprice": 2590000,
    "image": "",
    "description": "Tai nghe không dây với chống ồn chủ động.",
    "specification": "Bluetooth 5.0; Pin 30h; Chống ồn ANC.",
    "buyturn": 310,
    "quantity": 35,
    "brand_id": 6,
    "category_id": 7
  },
  {
    "name": "Quần jogger nam",
    "price": 279000,
    "oldprice": 350000,
    "image": "",
    "description": "Quần jogger thể thao, thoải mái khi vận động.",
    "specification": "Chất liệu: Cotton; Màu: Đen, Xám; Size: M, L, XL.",
    "buyturn": 260,
    "quantity": 70,
    "brand_id": 2,
    "category_id": 2
  }
*/