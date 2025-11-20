const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

router.get("/categories", async (_req, res) => {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { name: "asc" },
  });
  res.json({ categories });
});

router.get("/items", async (req, res) => {
  const { category, search, dietary, maxPrice } = req.query;

  const filters = {};
  if (category && category !== "all") {
    filters.category = {
      is: { slug: category },
    };
  }

  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (dietary) {
    filters.dietary = { hasSome: dietary.split(",") };
  }

  if (maxPrice) {
    filters.price = {
      lte: Number(maxPrice),
    };
  }

  const items = await prisma.menuItem.findMany({
    where: filters,
    include: {
      category: true,
    },
    orderBy: { name: "asc" },
  });

  res.json({ items });
});

router.get("/items/:id", async (req, res) => {
  const item = await prisma.menuItem.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  res.json({ item });
});

module.exports = router;

