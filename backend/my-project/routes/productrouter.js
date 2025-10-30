const express = require("express");
const router = express.Router();
const {get_all_products,get_product_byId,add_product,updateProduct,deleteProduct,get_all_brands,} = require("../controllers/productsController")
const { authMiddleware, restrictTo } = require('../auth/auth')




router.get("/",  get_all_products) 
router.get("/brands", authMiddleware, get_all_brands) 
router.get("/:id", authMiddleware, restrictTo("admin", "user"), get_product_byId)
router.post("/addproducts", authMiddleware, restrictTo("admin"), add_product)
router.patch("/update/:id", authMiddleware, restrictTo("admin"), updateProduct)
router.delete("/delete/:id", authMiddleware, restrictTo("admin"), deleteProduct)

module.exports = router;
