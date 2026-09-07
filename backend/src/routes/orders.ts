import { Router } from "express";
import { db } from "../prisma/db";

const router = Router();


// =========================================================
// TYPES
// =========================================================

type OrderItemInput = {
  id?: number | string;
  productId?: number | string;

  name?: string;
  productName?: string;

  image?: string;
  productImage?: string;

  selectedSize?: string;
  size?: string;

  selectedColor?: string;
  color?: string;

  price?: number | string;
  quantity?: number | string;

  category?: string;
};


type CustomerInput = {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};


type AddressInput = {
  address?: string;
  addressLine1?: string;

  apartment?: string;
  addressLine2?: string;

  city?: string;
  state?: string;

  pincode?: string;
  postalCode?: string;

  country?: string;
};


type CreateOrderBody = {
  userId?: number | string;

  customer?: CustomerInput;
  address?: AddressInput;

  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;

  items?: OrderItemInput[];

  paymentMethod?: string;

  subtotal?: number | string;
  discount?: number | string;
  shipping?: number | string;
  shippingFee?: number | string;
  total?: number | string;
};


// =========================================================
// HELPERS
// =========================================================

function cleanString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function toNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


// =========================================================
// CREATE ORDER
// POST /api/orders
// =========================================================

router.post("/", async (req, res) => {
  try {
    const body = req.body as CreateOrderBody;

    const parsedUserId = Number(body.userId);


    // -------------------------------------------------------
    // USER ID
    // -------------------------------------------------------

    if (
      !parsedUserId ||
      Number.isNaN(parsedUserId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }


    // -------------------------------------------------------
    // CHECK USER
    // -------------------------------------------------------

    const user =
      await db.orm.public.User
        .where({
          id: parsedUserId,
        })
        .first();


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // -------------------------------------------------------
    // CUSTOMER
    // -------------------------------------------------------

    const nestedCustomer =
      body.customer || {};


    const customerName =
      cleanString(
        nestedCustomer.name
      ) ||
      cleanString(
        `${nestedCustomer.firstName || ""} ${
          nestedCustomer.lastName || ""
        }`
      ) ||
      cleanString(
        body.customerName
      );


    const customerEmail =
      cleanString(
        nestedCustomer.email
      ) ||
      cleanString(
        body.customerEmail
      );


    const customerPhone =
      cleanString(
        nestedCustomer.phone
      ) ||
      cleanString(
        body.customerPhone
      );


    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }


    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required",
      });
    }


    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer phone is required",
      });
    }


    // -------------------------------------------------------
    // ADDRESS
    // -------------------------------------------------------

    const nestedAddress =
      body.address || {};


    const shippingAddress1 =
      cleanString(
        nestedAddress.address
      ) ||
      cleanString(
        nestedAddress.addressLine1
      ) ||
      cleanString(
        body.shippingAddress1
      );


    const shippingAddress2 =
      cleanString(
        nestedAddress.apartment
      ) ||
      cleanString(
        nestedAddress.addressLine2
      ) ||
      cleanString(
        body.shippingAddress2
      );


    const shippingCity =
      cleanString(
        nestedAddress.city
      ) ||
      cleanString(
        body.shippingCity
      );


    const shippingState =
      cleanString(
        nestedAddress.state
      ) ||
      cleanString(
        body.shippingState
      );


    const shippingPostalCode =
      cleanString(
        nestedAddress.pincode
      ) ||
      cleanString(
        nestedAddress.postalCode
      ) ||
      cleanString(
        body.shippingPostalCode
      );


    const shippingCountry =
      cleanString(
        nestedAddress.country
      ) ||
      cleanString(
        body.shippingCountry
      ) ||
      "India";


    if (!shippingAddress1) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }


    if (!shippingCity) {
      return res.status(400).json({
        success: false,
        message: "Shipping city is required",
      });
    }


    if (!shippingState) {
      return res.status(400).json({
        success: false,
        message: "Shipping state is required",
      });
    }


    if (!shippingPostalCode) {
      return res.status(400).json({
        success: false,
        message: "Shipping postal code is required",
      });
    }


    // -------------------------------------------------------
    // ITEMS
    // -------------------------------------------------------

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }


    // -------------------------------------------------------
    // PAYMENT
    // -------------------------------------------------------

    const paymentMethod =
      cleanString(
        body.paymentMethod
      ) || "cod";


    // =======================================================
    // RESOLVE PRODUCTS
    // =======================================================

    const resolvedItems: Array<{
      productId: number;
      productName: string;
      productImage: string;
      size: string | null;
      color: string | null;
      price: number;
      quantity: number;
    }> = [];


    for (const item of body.items) {

      const requestedProductId =
        Number(
          item.productId ??
          item.id
        );


      if (
        !requestedProductId ||
        Number.isNaN(requestedProductId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product in order",
        });
      }


      const quantity =
        Number(
          item.quantity || 1
        );


      if (
        !Number.isFinite(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }


      const productName =
        cleanString(
          item.productName
        ) ||
        cleanString(
          item.name
        ) ||
        "Product";


      const productImage =
        cleanString(
          item.productImage
        ) ||
        cleanString(
          item.image
        );


      const price =
        toNumber(
          item.price
        );


      // -----------------------------------------------------
      // FIND PRODUCT BY ID
      // -----------------------------------------------------

      let product =
        await db.orm.public.Product
          .where({
            id: requestedProductId,
          })
          .first();


      // -----------------------------------------------------
      // FIND PRODUCT BY NAME
      // -----------------------------------------------------

      if (!product) {
        product =
          await db.orm.public.Product
            .where({
              name: productName,
            })
            .first();
      }


      // -----------------------------------------------------
      // DEVELOPMENT FALLBACK
      // -----------------------------------------------------

      if (!product) {
        product =
          await db.orm.public.Product.create({

            name:
              productName,

            description:
              "Product added from the FashionStore catalog",

            category:
              cleanString(
                item.category
              ) ||
              "Uncategorized",

            subcategory:
              null,

            price:
              Math.round(price),

            oldPrice:
              null,

            image:
              productImage,

            badge:
              null,

            isNew:
              false,

            isSale:
              false,

            isActive:
              true,
          });
      }


      resolvedItems.push({

        productId:
          product.id,

        productName:
          productName,

        productImage:
          productImage,

        size:
          cleanString(
            item.selectedSize
          ) ||
          cleanString(
            item.size
          ) ||
          null,

        color:
          cleanString(
            item.selectedColor
          ) ||
          cleanString(
            item.color
          ) ||
          null,

        price:
          Math.round(price),

        quantity:
          Math.floor(quantity),
      });
    }


    // =======================================================
    // PRICING
    // =======================================================

    const subtotal =
      toNumber(
        body.subtotal
      );


    const discount =
      toNumber(
        body.discount
      );


    const shippingFee =
      toNumber(
        body.shippingFee ??
        body.shipping
      );


    const total =
      toNumber(
        body.total
      );


    // =======================================================
    // ORDER NUMBER
    // =======================================================

    const orderNumber =
      "FS" +
      Date.now()
        .toString()
        .slice(-8);


    // =======================================================
    // CREATE ORDER
    // =======================================================

    const order =
      await db.orm.public.Order.create({

        orderNumber,

        userId:
          parsedUserId,

        customerName:
          customerName,

        customerEmail:
          customerEmail.toLowerCase(),

        customerPhone:
          customerPhone,

        shippingAddress1:
          shippingAddress1,

        shippingAddress2:
          shippingAddress2 ||
          null,

        shippingCity:
          shippingCity,

        shippingState:
          shippingState,

        shippingPostalCode:
          shippingPostalCode,

        shippingCountry:
          shippingCountry,

        subtotal:
          Math.round(subtotal),

        discount:
          Math.round(discount),

        shippingFee:
          Math.round(shippingFee),

        total:
          Math.round(total),

        couponCode:
          null,

        paymentMethod:
          paymentMethod,

        paymentStatus:
          "PENDING",

        orderStatus:
          "PLACED",

        trackingNumber:
          null,

        courierName:
          null,
      });


    // =======================================================
    // CREATE ORDER ITEMS
    // =======================================================

    for (
      const item of resolvedItems
    ) {

      await db.orm.public.OrderItem.create({

        orderId:
          order.id,

        productId:
          item.productId,

        productName:
          item.productName,

        productImage:
          item.productImage,

        size:
          item.size,

        color:
          item.color,

        price:
          item.price,

        quantity:
          item.quantity,
      });
    }


    // =======================================================
    // FETCH COMPLETE ORDER
    // =======================================================

    const createdOrder =
      await db.orm.public.Order
        .where({
          id: order.id,
        })
        .include("items")
        .first();


    // =======================================================
    // SUCCESS
    // =======================================================

    return res.status(201).json({

      success:
        true,

      message:
        "Order placed successfully",

      order:
        createdOrder,
    });


  } catch (error: unknown) {

    console.error(
      "CREATE ORDER ERROR:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while placing your order";


    return res.status(500).json({

      success:
        false,

      message:
        message,
    });
  }
});


// =========================================================
// GET ALL ORDERS
// GET /api/orders?userId=1
// =========================================================

router.get("/", async (req, res) => {
  try {

    const userId =
      Number(
        req.query.userId
      );


    if (
      !userId ||
      Number.isNaN(userId)
    ) {
      return res.status(400).json({

        success:
          false,

        message:
          "Valid user ID is required",
      });
    }


    // -------------------------------------------------------
    // CHECK USER
    // -------------------------------------------------------

    const user =
      await db.orm.public.User
        .where({
          id: userId,
        })
        .first();


    if (!user) {
      return res.status(404).json({

        success:
          false,

        message:
          "User not found",
      });
    }


    // -------------------------------------------------------
    // GET ORDERS
    // -------------------------------------------------------

    const orders =
      await db.orm.public.Order
        .where({
          userId,
        })
        .include("items")
        .orderBy(
          (order) =>
            order.createdAt.desc()
        )
        .all();


    return res.status(200).json({

      success:
        true,

      orders:
        orders,
    });


  } catch (error: unknown) {

    console.error(
      "GET ORDERS ERROR:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to load orders",
    });
  }
});


// =========================================================
// GET SINGLE ORDER
// GET /api/orders/:id?userId=1
// =========================================================

router.get("/:id", async (req, res) => {
  try {

    const orderId =
      Number(
        req.params.id
      );


    const userId =
      Number(
        req.query.userId
      );


    // -------------------------------------------------------
    // VALIDATE ORDER ID
    // -------------------------------------------------------

    if (
      !orderId ||
      Number.isNaN(orderId)
    ) {
      return res.status(400).json({

        success:
          false,

        message:
          "Valid order ID is required",
      });
    }


    // -------------------------------------------------------
    // VALIDATE USER ID
    // -------------------------------------------------------

    if (
      !userId ||
      Number.isNaN(userId)
    ) {
      return res.status(400).json({

        success:
          false,

        message:
          "Valid user ID is required",
      });
    }


    // -------------------------------------------------------
    // FIND ORDER
    // -------------------------------------------------------

    const order =
      await db.orm.public.Order
        .where({
          id:
            orderId,

          userId:
            userId,
        })
        .include("items")
        .first();


    if (!order) {
      return res.status(404).json({

        success:
          false,

        message:
          "Order not found",
      });
    }


    return res.status(200).json({

      success:
        true,

      order:
        order,
    });


  } catch (error: unknown) {

    console.error(
      "GET SINGLE ORDER ERROR:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to load order",
    });
  }
});


// =========================================================
// UPDATE ORDER STATUS
// PATCH /api/orders/:id/status
// =========================================================

router.patch(
  "/:id/status",
  async (req, res) => {

    try {

      const orderId =
        Number(
          req.params.id
        );


      const {
        orderStatus,
        trackingNumber,
        courierName,
      } = req.body;


      // -----------------------------------------------------
      // VALIDATE ORDER ID
      // -----------------------------------------------------

      if (
        !orderId ||
        Number.isNaN(orderId)
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Valid order ID is required",
        });
      }


      // -----------------------------------------------------
      // ALLOWED STATUSES
      // -----------------------------------------------------

      const allowedStatuses = [

        "PLACED",

        "CONFIRMED",

        "PROCESSING",

        "SHIPPED",

        "OUT_FOR_DELIVERY",

        "DELIVERED",

        "CANCELLED",

      ];


      // -----------------------------------------------------
      // VALIDATE STATUS
      // -----------------------------------------------------

      if (
        !orderStatus ||
        !allowedStatuses.includes(
          orderStatus
        )
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid order status",

          allowedStatuses:
            allowedStatuses,
        });
      }


      // -----------------------------------------------------
      // FIND ORDER
      // -----------------------------------------------------

      const existingOrder =
        await db.orm.public.Order
          .where({
            id:
              orderId,
          })
          .first();


      if (!existingOrder) {

        return res.status(404).json({

          success:
            false,

          message:
            "Order not found",
        });
      }


      // -----------------------------------------------------
      // UPDATE STATUS
      // -----------------------------------------------------

      await db.orm.public.Order
        .where({
          id:
            orderId,
        })
        .update({

          orderStatus:
            orderStatus,

          trackingNumber:
            trackingNumber !== undefined
              ? cleanString(
                  trackingNumber
                ) || null
              : existingOrder.trackingNumber,

          courierName:
            courierName !== undefined
              ? cleanString(
                  courierName
                ) || null
              : existingOrder.courierName,
        });


      // -----------------------------------------------------
      // FETCH UPDATED ORDER
      // -----------------------------------------------------

      const updatedOrder =
        await db.orm.public.Order
          .where({
            id:
              orderId,
          })
          .include("items")
          .first();


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      return res.status(200).json({

        success:
          true,

        message:
          "Order status updated successfully",

        order:
          updatedOrder,
      });


    } catch (error: unknown) {

      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          "Unable to update order status",
      });
    }
  }
);


// =========================================================
// EXPORT ROUTER
// =========================================================

export default router;