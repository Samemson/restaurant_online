const express = require("express");
const authRoutes = require("./auth");
const menuRoutes = require("./menu");
const cartRoutes = require("./cart");
const ordersRoutes = require("./orders");
const analyticsRoutes = require("./analytics");
const kitchenRoutes = require("./kitchen");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/menu", menuRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", ordersRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/kitchen", kitchenRoutes);

module.exports = router;

