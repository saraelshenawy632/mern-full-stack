const express = require("express");
const router = express.Router();
const {addToCart,showCart, deleteFromCart,changeQuantity}=require('../controllers/cartcontroller')
const {authMiddleware,restrictTo }=require('../auth/auth')


router.get('/allcart',authMiddleware,restrictTo ("admin","user"), showCart)
router.post("/add",authMiddleware,restrictTo ("admin","user"),addToCart)
router.delete("/delete/:Id",authMiddleware,restrictTo ("admin","user"),deleteFromCart)
router.put("/change-quantity", authMiddleware,restrictTo ("admin","user"), changeQuantity)

module.exports=router
