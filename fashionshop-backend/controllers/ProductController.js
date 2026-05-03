import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models"
import { getAvatarUrl } from "../helpers/imageHelper";

export async function getProducts(req, res) {
  // const products = await db.Product.findAll(); // Phai phan trang

  const { search = '', page = 1, category_id, brand_id, page_size = 6 } = req.query;
  const pageSize = parseInt(page_size, 10) || 6;
  const offset = (page - 1) * pageSize;

  let whereClause = {};
  if (search.trim() !== '') {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  if (category_id) {
    const categoryIds = category_id.split(',').map(id => parseInt(id, 10));
    whereClause.category_id = { [Op.in]: categoryIds };
  }

  if (brand_id) {
    const brandIds = brand_id.split(',').map(id => parseInt(id, 10));
    whereClause.brand_id = { [Op.in]: brandIds };
  }

  const [products, totalProducts] = await Promise.all([
    db.Product.findAll({
      where: whereClause,
      include: [
        {
          model: db.ProductAttributeValue,
          as: 'product_attribute_values', 
          include: [
            {
              model: db.Attribute,
              as: 'attribute',
              attributes: ['id', 'name'],
            },
          ],
          required: false, 
        },
      ],
      limit: pageSize,
      offset: offset,
    }),
    db.Product.count({
      where: whereClause,
      distinct: true,
      include: [
        {
          model: db.ProductAttributeValue,
          as: 'product_attribute_values', 
          required: false,
        },
      ],
    }),
  ]);

  const formattedProducts = products.map(product => {
    const plainProduct = product.get({ plain: true });

    const attributes = plainProduct.product_attribute_values?.map(attr => ({
      id: attr.attribute?.id || null,
      name: attr.attribute?.name || null,
      value: attr.value || null,
    })) || [];

    delete plainProduct.product_attribute_values;

    return {
      ...plainProduct,
      image: getAvatarUrl(plainProduct.image), 
      attributes, 
    };
  });


  res.status(200).json({
    message: 'Lấy danh sách sản phẩm thành công',
    data: formattedProducts,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalProducts / pageSize),
    total: totalProducts,
  });
}

export const checkAndFetchVariant = async (req, res) => {
  try {
    console.log(Object.keys(req.body));
    const { product_id, ...bodyData } = req.body; // Lấy product_id và các key-value còn lại từ body    

    const keys = Object.keys(bodyData);

    if (!product_id) {
      return res.status(400).json({
        message: 'Thiếu trường product_id trong dữ liệu đầu vào.',
      });
    }

    if (!keys.length) {
      return res.status(400).json({
        message: 'Dữ liệu đầu vào không hợp lệ, cần ít nhất một key-value.',
      });
    }

    // Kiểm tra xem product_id có tồn tại không
    const product = await db.Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        message: `Không tìm thấy sản phẩm với ID ${product_id}.`,
      });
    }

    // Duyệt qua các key-value
    const variantValueIds = [];
    for (const key of keys) {
      const value = bodyData[key];

      // Kiểm tra trong bảng Variant
      const variant = await db.Variant.findOne({
        where: { name: key },
      });

      if (!variant) {
        return res.status(404).json({
          message: `Không tìm thấy variant với tên "${key}".`,
        });
      }

      // Kiểm tra trong bảng VariantValue
      const variantValue = await db.VariantValue.findOne({
        where: {
          variant_id: variant.id,
          value: value,
        },
      });

      if (!variantValue) {
        return res.status(404).json({
          message: `Không tìm thấy giá trị "${value}" trong variant "${key}".`,
        });
      }

      // Thêm id của variant_value vào danh sách
      variantValueIds.push(variantValue.id);
    }

    // Tạo chuỗi SKU từ danh sách id
    const sku = variantValueIds.sort((a, b) => a - b).join('-');

    // Kiểm tra xem SKU này có tồn tại trong bảng product_variant_values không
    const productVariantValue = await db.ProductVariantValue.findOne({
      where: {
        sku,
        product_id, // Kiểm tra thêm điều kiện product_id
      },
    });

    if (!productVariantValue) {
      return res.status(404).json({
        message: 'Không tìm thấy product_variant_value với SKU được tạo và product_id.',
      });
    }

    // Trả về bản ghi product_variant_value
    res.status(200).json({
      message: 'Lấy thông tin product_variant_value thành công.',
      data: productVariantValue,
    });
  } catch (error) {
    console.error('Lỗi khi xử lý API checkAndFetchVariant:', error);
    res.status(500).json({
      message: 'Đã xảy ra lỗi trong quá trình xử lý.',
      error: error.message,
    });
  }
};

export async function getProductById(req, res) {
  const productId = req.params.id; // Cách 1: Lấy tham số id truyền vào từ params
  const { id } = req.params;       // Cách 2: tìm trong params có trường id thì lấy giá trị của nó 
  const product = await db.Product.findByPk(id, {
    include: [{
      model: db.ProductImage,
      as: 'product_images',
    },
    {
      model: db.ProductAttributeValue,
      as: 'product_attribute_values',
      include: [{
        model: db.Attribute,
        as: 'attribute',
        attributes: ['id', 'name']
      }]
    },
    {
      model: db.ProductVariantValue,
      as: 'product_variant_values',
      attributes: ['id', 'price', 'old_price', 'stock', 'sku']
    }
    ]
  });
  if (!product) {
    // If not found product, return a 404 Not Found response
    return res.status(400).json({
      message: 'Product does not exists'
    })
  }

  const variantValuesData = [];
  for (const variant of product.product_variant_values) {
    const variantValueIds = variant.sku.split('-').map(Number);
    const variantValues = await db.VariantValue.findAll({
      where: {
        id: variantValueIds
      },
      include: [{
        model: db.Variant,
        as: 'variant',
        attributes: ['id', 'name']
      }]
    });

    variantValuesData.push({
      id: variant.id,
      price: variant.price,
      old_price: variant.old_price,
      stock: variant.stock,
      sku: variant.sku,
      values: variantValues.map(value => ({
        id: value.id,
        name: value.variant?.name || null,
        value: value.value,
        image: value.image || null,
      }))
    });
  }

  const productData = {
    ...product.get({ plain: true }),
    image: getAvatarUrl(product.image),
    product_images: product.product_images.map(image => getAvatarUrl(image.image_url)),
    attributes: product.product_attribute_values.map(attr => ({
      name: attr.attribute?.name || null,
      value: attr.value
    })),
    variants: variantValuesData
  };

  res.status(200).json({
    message: 'Get Product detail successfully',
    data: productData
  });
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

  // const userId = req.body.user_id;

  // const user = await db.User.findByPk(userId);
  // if (!user) {
  //   return res.status(404).json({
  //     message: 'User does not exist'
  //   })
  // }
  const { name, attributes = [], variants = [], variant_values = [], ...productData } = req.body;
  const { category_id, brand_id } = productData;

  const categoryExists = await db.Category.findByPk(category_id);
  if (!categoryExists) {
    return res.status(404).json({
      message: 'Category does not exist'
    })
  }

  const brandExists = await db.Brand.findByPk(brand_id);
  if (!brandExists) {
    return res.status(404).json({
      message: 'Brand does not exist'
    })
  }
  const transaction = await db.sequelize.transaction();

  const existingProduct = await db.Product.findOne({
    where: {
      name: name
    }
  });
  if (existingProduct) {
    return res.status(400).json({
      message: 'Product with the same name already exists',
      data: existingProduct
    })
  }

  const product = await db.Product.create(
    { ...productData, name },
    { transaction }
  );

  const createdAttributes = [];
  for (const attributeData of attributes) {
    const [attribute] = await db.Attribute.findOrCreate({
      where: { name: attributeData.name },
      transaction,
    });

    await db.ProductAttributeValue.create(
      {
        product_id: product.id,
        attribute_id: attribute.id,
        value: attributeData.value,
      },
      { transaction }
    );

    createdAttributes.push({
      name: attribute.name,
      value: attributeData.value
    });
  }

  for (const variant of variants) {
    const [variantEntry] = await db.Variant.findOrCreate({
      where: { name: variant.name },
      transaction,
    });

    for (const value of variant.values) {
      await db.VariantValue.findOrCreate({
        where: {
          value,
          variant_id: variantEntry.id
        },
        transaction,
      })
    }
  }

  const createdVariantValues = [];
  for (const variantData of variant_values) {
    const variantValueIds = [];
    for (const value of variantData.variant_combination) {
      const variantValue = await db.VariantValue.findOne({
        where: {
          value
        }, transaction,
      });

      if (variantValue) {
        variantValueIds.push(variantValue.id);
      }
    }

    const sku = variantValueIds.sort((a, b) => a - b).join('-');

    const createdVariant = await db.ProductVariantValue.create(
      {
        product_id: product.id,
        price: variantData.price,
        old_price: variantData.old_price || null,
        stock: variantData.stock || 0,
        sku,
      },
      { transaction }
    );

    createdVariantValues.push({
      sku,
      price: createdVariant.price,
      old_price: createdVariant.old_price,
      stock: createdVariant.stock,
    });
  }
  await transaction.commit();

  return res.status(201).json({
    message: 'Insert Product successfully',
    data: {
      ...product.get({ plain: true }),
      image: getAvatarUrl(product.image),
      attributes: createdAttributes,
      variants: variants.map(variant => ({
        name: variant.name,
        values: variant.values
      })),
      variant_values: createdVariantValues
    }
  })
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  const orderDetailExists = await db.OrderDetail.findOne({
    where: { product_id: id },
    include: [{
      model: db.Order,
      as: 'order',
      attributes: ['id', 'status', 'note', 'total', 'created_at'],
    }]
  });

  if (orderDetailExists) {
    return res.status(400).json({
      message: 'Cannot delete product because it is associated with existing orders',
      data: { order: orderDetailExists.order }
    })
  }

  await db.ProductAttributeValue.destroy({
    where: { product_id: id }
  });

  const deleted = await db.Product.destroy({
    where: { id }
  });
  if (deleted) {
    return res.status(200).json({
      message: 'Delete product successfully'
    })
  } else {
    return res.status(404).json({
      message: 'Product not found'
    })
  }
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { attributes = [], ...productData } = req.body;

  const [updatedRowCount] = await db.Product.update(productData, {
    where: { id }
  });

  if (updatedRowCount > 0) {
    for (const attr of attributes) {
      const [attribute] = await db.Attribute.findOrCreate({
        where: { name: attr.name },
      });

      const productAttributeValue = await db.ProductAttributeValue.findOne({
        where: {
          product_id: id,
          attribute_id: attribute.id,
        }
      });

      if (productAttributeValue) {
        await productAttributeValue.update({
          value: attr.value,
        });
      } else {
        await db.ProductAttributeValue.create({
          product_id: id,
          attribute_id: attribute.id,
          value: attr.value,
        });
      }
    }
    return res.status(200).json({
      message: 'Update product successfully'
    })
  } else {
    return res.status(404).json({
      message: 'Product not found'
    })
  }
}

export async function getVariantDetailsByProduct(req, res) {
  const { product_id } = req.params; 
  const { variants } = req.query; 

  const productExists = await db.Product.findByPk(product_id);
  if (!productExists) {
    return res.status(400).json({
      message: `Product ID ${product_id} không tồn tại, vui lòng kiểm tra lại.`,
    });
  }

  const variantValueIds = variants ? variants.split(',').map(id => parseInt(id, 10)) : [];
  if (variantValueIds.length === 0) {
    return res.status(400).json({
      message: 'Danh sách variants không hợp lệ hoặc không được cung cấp.',
    });
  }

  const sku = variantValueIds.sort((a, b) => a - b).join('-');

  const productVariantValues = await db.ProductVariantValue.findAll({
    where: {
      product_id,
      sku,
    },
  });

  if (productVariantValues.length === 0) {
    return res.status(404).json({
      message: `Không tìm thấy biến thể nào với SKU "${sku}" cho sản phẩm ${product_id}.`,
    });
  }

  const detailedVariants = productVariantValues.map(variant => ({
    id: variant.id,
    price: variant.price,
    old_price: variant.old_price || null,
    stock: variant.stock,
    sku: variant.sku,
  }));

  res.status(200).json({
    message: 'Lấy thông tin chi tiết biến thể thành công',
    data: detailedVariants,
  });
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