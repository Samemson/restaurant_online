const express = require("express");
const { subDays } = require("date-fns");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/summary", requireAuth(["ADMIN"]), async (_req, res) => {
  const [ordersCount, totalRevenue, topItems] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const enrichedTopItems = await Promise.all(
    topItems.map(async (item) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      return {
        id: menuItem.id,
        name: menuItem.name,
        quantity: item._sum.quantity || 0,
      };
    })
  );

  res.json({
    ordersCount,
    totalRevenue: totalRevenue._sum.total || 0,
    topItems: enrichedTopItems,
  });
});

router.get("/dashboard", requireAuth(["ADMIN"]), async (req, res) => {
  const range = req.query.range || "week";
  const rangeToDays = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  };
  const daysBack = rangeToDays[range] || 7;
  const startDate = subDays(new Date(), daysBack);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
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

  const summary = {
    totalSales: orders.reduce((sum, order) => sum + Number(order.total), 0),
    totalOrders: orders.length,
    averageOrderValue:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + Number(order.total), 0) /
          orders.length
        : 0,
    customerSatisfaction: 4.7,
  };

  const trendMap = {};
  orders.forEach((order) => {
    const key = order.createdAt.toISOString().split("T")[0];
    trendMap[key] = (trendMap[key] || 0) + Number(order.total);
  });
  const salesTrend = Object.entries(trendMap).map(([date, sales]) => ({
    date,
    sales,
  }));

  const statusDistribution = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const orderStatusDistribution = Object.entries(statusDistribution).map(
    ([status, value]) => ({ status, value })
  );

  const topItemsGrouped = await prisma.orderItem.groupBy({
    where: {
      order: { createdAt: { gte: startDate } },
    },
    by: ["menuItemId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const topSellingItems = await Promise.all(
    topItemsGrouped.map(async (group) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: group.menuItemId },
        include: { category: true },
      });
      return {
        id: menuItem.id,
        name: menuItem.name,
        category: menuItem.category?.name || "Menu",
        sales: group._sum.quantity || 0,
        revenue: Number(menuItem.price) * (group._sum.quantity || 0),
        growth: 5,
      };
    })
  );

  const recentOrders = orders.slice(-5).map((order) => ({
    id: order.id,
    type: "order",
    title: `Order #${order.id.substring(0, 6)} ${order.status.toLowerCase()}`,
    description: `${order.user.firstName} ${order.user.lastName} - $${Number(
      order.total
    ).toFixed(2)}`,
    timestamp: order.createdAt,
    status: order.status.toLowerCase(),
  }));

  const recentEvents = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentActivity = [
    ...recentOrders,
    ...recentEvents.map((event) => ({
      id: event.id,
      type: event.type.toLowerCase(),
      title: event.type.replace("_", " "),
      description:
        typeof event.data === "object" ? JSON.stringify(event.data) : "",
      timestamp: event.createdAt,
      status: "info",
    })),
  ]
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5);

  const locationPerformance = [
    { id: 1, name: "Downtown", orders: Math.round(summary.totalOrders * 0.45), sales: summary.totalSales * 0.55, satisfaction: 4.8 },
    { id: 2, name: "Westside", orders: Math.round(summary.totalOrders * 0.35), sales: summary.totalSales * 0.25, satisfaction: 4.6 },
    { id: 3, name: "Northgate", orders: Math.max(summary.totalOrders - (Math.round(summary.totalOrders * 0.45) + Math.round(summary.totalOrders * 0.35)), 0), sales: summary.totalSales * 0.2, satisfaction: 4.7 },
  ];

  res.json({
    summary,
    salesTrend,
    topSellingItems,
    orderStatusDistribution,
    locationPerformance,
    recentActivity,
  });
});

router.get("/events", requireAuth(["ADMIN"]), async (_req, res) => {
  const events = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ events });
});

module.exports = router;

