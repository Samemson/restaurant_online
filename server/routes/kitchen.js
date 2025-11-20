const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/queue", requireAuth(["ADMIN", "STAFF"]), async (_req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PENDING", "IN_PROGRESS", "READY"],
      },
    },
    include: {
      items: {
        include: { item: true },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json({ orders });
});

router.get("/metrics", requireAuth(["ADMIN", "STAFF"]), async (_req, res) => {
  const [pending, inProgress, ready] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "IN_PROGRESS" } }),
    prisma.order.count({ where: { status: "READY" } }),
  ]);

  res.json({
    pending,
    inProgress,
    ready,
  });
});

module.exports = router;

