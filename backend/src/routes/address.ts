import { Router } from "express";
import { db } from "../prisma/db";

const router = Router();


// =========================================================
// GET ALL ADDRESSES FOR USER
// GET /api/addresses?userId=1
// =========================================================

router.get("/", async (req, res) => {
  try {
    const userId = Number(req.query.userId);

    // -------------------------------------------------------
    // VALIDATE USER ID
    // -------------------------------------------------------

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    // -------------------------------------------------------
    // CHECK USER
    // -------------------------------------------------------

    const user = await db.orm.public.User
      .where({
        id: userId,
      })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------------------------------
    // GET ADDRESSES
    // -------------------------------------------------------

    const addresses = await db.orm.public.Address
      .where({
        userId,
      })
      .all();

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,
      addresses,
    });

  } catch (error) {
    console.error(
      "Get addresses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while loading addresses",
    });
  }
});


// =========================================================
// ADD NEW ADDRESS
// POST /api/addresses
// =========================================================

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const parsedUserId = Number(userId);

    // -------------------------------------------------------
    // USER ID VALIDATION
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
    // FIELD VALIDATION
    // -------------------------------------------------------

    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number must contain exactly 10 digits",
      });
    }

    if (!addressLine1?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    if (!city?.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    if (!state?.trim()) {
      return res.status(400).json({
        success: false,
        message: "State is required",
      });
    }

    if (!postalCode?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Postal code is required",
      });
    }

    if (!/^[0-9]{6}$/.test(postalCode.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Postal code must contain exactly 6 digits",
      });
    }

    // -------------------------------------------------------
    // CHECK USER
    // -------------------------------------------------------

    const user = await db.orm.public.User
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
    // GET EXISTING ADDRESSES
    // -------------------------------------------------------

    const existingAddresses =
      await db.orm.public.Address
        .where({
          userId: parsedUserId,
        })
        .all();

    // -------------------------------------------------------
    // FIRST ADDRESS SHOULD AUTOMATICALLY BE DEFAULT
    // -------------------------------------------------------

    let shouldBeDefault =
      isDefault === true;

    if (existingAddresses.length === 0) {
      shouldBeDefault = true;
    }

    // -------------------------------------------------------
    // REMOVE CURRENT DEFAULT
    // -------------------------------------------------------

    if (shouldBeDefault) {
      for (const address of existingAddresses) {
        if (address.isDefault) {
          await db.orm.public.Address
            .where({
              id: address.id,
            })
            .update({
              isDefault: false,
            });
        }
      }
    }

    // -------------------------------------------------------
    // CREATE ADDRESS
    // -------------------------------------------------------

    const address =
      await db.orm.public.Address.create({
        userId: parsedUserId,

        fullName:
          fullName.trim(),

        phone:
          phone.trim(),

        addressLine1:
          addressLine1.trim(),

        addressLine2:
          addressLine2?.trim() || null,

        city:
          city.trim(),

        state:
          state.trim(),

        postalCode:
          postalCode.trim(),

        country:
          country?.trim() || "India",

        isDefault:
          shouldBeDefault,
      });

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Address added successfully",
      address,
    });

  } catch (error) {
    console.error(
      "Add address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while adding the address",
    });
  }
});


// =========================================================
// UPDATE ADDRESS
// PUT /api/addresses/:id
// =========================================================

router.put("/:id", async (req, res) => {
  try {
    const addressId =
      Number(req.params.id);

    const userId =
      Number(req.body.userId);

    // -------------------------------------------------------
    // ID VALIDATION
    // -------------------------------------------------------

    if (
      !addressId ||
      Number.isNaN(addressId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid address ID is required",
      });
    }

    if (
      !userId ||
      Number.isNaN(userId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid user ID is required",
      });
    }

    // -------------------------------------------------------
    // DATA
    // -------------------------------------------------------

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number must contain exactly 10 digits",
      });
    }

    if (!addressLine1?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    if (!city?.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    if (!state?.trim()) {
      return res.status(400).json({
        success: false,
        message: "State is required",
      });
    }

    if (!postalCode?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Postal code is required",
      });
    }

    if (!/^[0-9]{6}$/.test(postalCode.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Postal code must contain exactly 6 digits",
      });
    }

    // -------------------------------------------------------
    // FIND ADDRESS
    // -------------------------------------------------------

    const existingAddress =
      await db.orm.public.Address
        .where({
          id: addressId,
        })
        .first();

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // -------------------------------------------------------
    // SECURITY CHECK
    // -------------------------------------------------------

    if (
      existingAddress.userId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot modify this address",
      });
    }

    // -------------------------------------------------------
    // GET USER ADDRESSES
    // -------------------------------------------------------

    const userAddresses =
      await db.orm.public.Address
        .where({
          userId,
        })
        .all();

    // -------------------------------------------------------
    // DEFAULT ADDRESS LOGIC
    // -------------------------------------------------------

    let shouldBeDefault =
      isDefault === true;

    // If the current address is already the only/default
    // address and user doesn't explicitly change it,
    // keep its current state.

    if (
      userAddresses.length === 1
    ) {
      shouldBeDefault = true;
    }

    // -------------------------------------------------------
    // REMOVE DEFAULT FROM OTHER ADDRESSES
    // -------------------------------------------------------

    if (shouldBeDefault) {
      for (const address of userAddresses) {
        if (
          address.id !== addressId &&
          address.isDefault
        ) {
          await db.orm.public.Address
            .where({
              id: address.id,
            })
            .update({
              isDefault: false,
            });
        }
      }
    }

    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------

    const updatedAddress =
      await db.orm.public.Address
        .where({
          id: addressId,
        })
        .update({
          fullName:
            fullName.trim(),

          phone:
            phone.trim(),

          addressLine1:
            addressLine1.trim(),

          addressLine2:
            addressLine2?.trim() || null,

          city:
            city.trim(),

          state:
            state.trim(),

          postalCode:
            postalCode.trim(),

          country:
            country?.trim() || "India",

          isDefault:
            shouldBeDefault,
        });

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Address updated successfully",
      address: updatedAddress,
    });

  } catch (error) {
    console.error(
      "Update address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating the address",
    });
  }
});


// =========================================================
// SET DEFAULT ADDRESS
// PATCH /api/addresses/:id/default
// =========================================================

router.patch(
  "/:id/default",
  async (req, res) => {
    try {
      const addressId =
        Number(req.params.id);

      const userId =
        Number(req.body.userId);

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      if (
        !addressId ||
        Number.isNaN(addressId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid address ID is required",
        });
      }

      if (
        !userId ||
        Number.isNaN(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid user ID is required",
        });
      }

      // -----------------------------------------------------
      // FIND ADDRESS
      // -----------------------------------------------------

      const address =
        await db.orm.public.Address
          .where({
            id: addressId,
          })
          .first();

      if (!address) {
        return res.status(404).json({
          success: false,
          message:
            "Address not found",
        });
      }

      // -----------------------------------------------------
      // SECURITY CHECK
      // -----------------------------------------------------

      if (
        address.userId !== userId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot modify this address",
        });
      }

      // -----------------------------------------------------
      // GET ALL USER ADDRESSES
      // -----------------------------------------------------

      const addresses =
        await db.orm.public.Address
          .where({
            userId,
          })
          .all();

      // -----------------------------------------------------
      // REMOVE DEFAULT
      // -----------------------------------------------------

      for (const item of addresses) {
        if (item.isDefault) {
          await db.orm.public.Address
            .where({
              id: item.id,
            })
            .update({
              isDefault: false,
            });
        }
      }

      // -----------------------------------------------------
      // SET SELECTED ADDRESS
      // -----------------------------------------------------

      const updatedAddress =
        await db.orm.public.Address
          .where({
            id: addressId,
          })
          .update({
            isDefault: true,
          });

      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          "Default address updated successfully",
        address: updatedAddress,
      });

    } catch (error) {
      console.error(
        "Set default address error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while setting the default address",
      });
    }
  }
);


// =========================================================
// DELETE ADDRESS
// DELETE /api/addresses/:id?userId=1
// =========================================================

router.delete("/:id", async (req, res) => {
  try {
    const addressId =
      Number(req.params.id);

    const userId =
      Number(req.query.userId);

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (
      !addressId ||
      Number.isNaN(addressId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid address ID is required",
      });
    }

    if (
      !userId ||
      Number.isNaN(userId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid user ID is required",
      });
    }

    // -------------------------------------------------------
    // FIND ADDRESS
    // -------------------------------------------------------

    const address =
      await db.orm.public.Address
        .where({
          id: addressId,
        })
        .first();

    if (!address) {
      return res.status(404).json({
        success: false,
        message:
          "Address not found",
      });
    }

    // -------------------------------------------------------
    // SECURITY CHECK
    // -------------------------------------------------------

    if (
      address.userId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot delete this address",
      });
    }

    // -------------------------------------------------------
    // DELETE
    // -------------------------------------------------------

    await db.orm.public.Address
      .where({
        id: addressId,
      })
      .delete();

    // -------------------------------------------------------
    // IF DELETED ADDRESS WAS DEFAULT,
    // MAKE ANOTHER ADDRESS DEFAULT
    // -------------------------------------------------------

    if (address.isDefault) {
      const remainingAddresses =
        await db.orm.public.Address
          .where({
            userId,
          })
          .all();

      if (
        remainingAddresses.length > 0
      ) {
        await db.orm.public.Address
          .where({
            id: remainingAddresses[0].id,
          })
          .update({
            isDefault: true,
          });
      }
    }

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Address deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while deleting the address",
    });
  }
});


// =========================================================
// EXPORT ROUTER
// =========================================================

export default router;