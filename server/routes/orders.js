const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { emitOrderUpdate, emitKitchenUpdate } = require("../realtime/bus");

const router = express.Router();

router.get("/", requireAuth(), async (req, res) => {
  const scope = req.query.scope;
  const where =
    scope === "all" && req.user.role !== "CUSTOMER"
      ? {}
      : { userId: req.user.id };

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          item: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ orders });
});

router.post("/", requireAuth(), async (req, res) => {
  const { cartId, deliveryEta, notes } = req.body;
  if (!cartId) {
    return res.status(400).json({ message: "cartId is required" });
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: { item: true },
      },
    },
  });

  if (!cart || cart.userId !== req.user.id) {
    return res.status(404).json({ message: "Cart not found" });
  }

  if (!cart.items.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const total = cart.items.reduce(
    (sum, cartItem) => sum + Number(cartItem.item.price) * cartItem.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      total,
      deliveryEta,
      items: {
        create: cart.items.map((cartItem) => ({
          menuItemId: cartItem.item.id,
          quantity: cartItem.quantity,
          price: cartItem.item.price,
          notes,
        })),
      },
    },
    include: {
      items: {
        include: { item: true },
      },
    },
  });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  emitOrderUpdate({
    orderId: order.id,
    status: order.status,
    userId: order.userId,
    total: order.total,
  });
  emitKitchenUpdate({ orderId: order.id, status: order.status });

  res.status(201).json({ order });
});

router.patch(
  "/:orderId/status",
  requireAuth(["ADMIN", "STAFF"]),
  async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = [
      "PENDING",
      "IN_PROGRESS",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { status },
      include: {
        items: {
          include: { item: true },
        },
      },
    });

    emitOrderUpdate({
      orderId: order.id,
      status: order.status,
      userId: order.userId,
      total: order.total,
    });

    emitKitchenUpdate({
      orderId: order.id,
      status: order.status,
      items: order.items,
    });

    res.json({ order });
  }
);

module.exports = router;

