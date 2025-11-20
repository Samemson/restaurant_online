const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: { item: true },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { item: true },
        },
      },
    });
  }

  return cart;
};

router.get("/", requireAuth(), async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  res.json({ cart });
});

router.post("/items", requireAuth(), async (req, res) => {
  const { menuItemId, quantity = 1, notes } = req.body;
  if (!menuItemId) {
    return res.status(400).json({ message: "menuItemId is required" });
  }

  const cart = await getOrCreateCart(req.user.id);

  const existingItem = cart.items.find((item) => item.menuItemId === menuItemId);
  let updatedItem;
  if (existingItem) {
    updatedItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: { item: true },
    });
  } else {
    updatedItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId,
        quantity,
        notes,
      },
      include: { item: true },
    });
  }

  const updatedCart = await getOrCreateCart(req.user.id);
  res.status(201).json({ cart: updatedCart, item: updatedItem });
});

router.patch("/items/:itemId", requireAuth(), async (req, res) => {
  const { quantity } = req.body;
  if (typeof quantity !== "number" || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }
  const cartItem = await prisma.cartItem.update({
    where: { id: req.params.itemId },
    data: { quantity },
    include: { item: true },
  });
  const cart = await getOrCreateCart(req.user.id);
  res.json({ cart, item: cartItem });
});

router.delete("/items/:itemId", requireAuth(), async (req, res) => {
  await prisma.cartItem.delete({ where: { id: req.params.itemId } });
  const cart = await getOrCreateCart(req.user.id);
  res.status(204).json({ cart });
});

router.post("/clear", requireAuth(), async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  const clearedCart = await getOrCreateCart(req.user.id);
  res.json({ cart: clearedCart });
});

module.exports = router;

