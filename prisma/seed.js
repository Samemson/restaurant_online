/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../server/utils/password");

const prisma = new PrismaClient();

const categories = [
  { slug: "all", name: "All Items", icon: "Grid3X3" },
  { slug: "appetizers", name: "Appetizers", icon: "Utensils" },
  { slug: "mains", name: "Main Course", icon: "ChefHat" },
  { slug: "desserts", name: "Desserts", icon: "Cake" },
  { slug: "beverages", name: "Beverages", icon: "Coffee" },
  { slug: "salads", name: "Salads", icon: "Leaf" },
  { slug: "soups", name: "Soups", icon: "Bowl" },
];

const menuItems = [
  {
    name: "Margherita Pizza",
    description:
      "Fresh mozzarella, tomato sauce, basil leaves on crispy thin crust",
    price: 18.99,
    imageUrl:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
    categorySlug: "mains",
    dietary: ["vegetarian"],
    spiceLevel: 0,
    prepTime: 15,
    allergens: ["gluten", "dairy"],
    isPopular: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    name: "Chicken Caesar Salad",
    description:
      "Grilled chicken breast, romaine lettuce, parmesan, croutons with caesar dressing",
    price: 14.99,
    imageUrl:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
    categorySlug: "salads",
    dietary: ["protein-rich"],
    spiceLevel: 0,
    prepTime: 10,
    allergens: ["dairy", "eggs"],
    rating: 4.6,
    reviewCount: 89,
  },
  {
    name: "Spicy Thai Curry",
    description:
      "Authentic red curry with coconut milk, vegetables, and jasmine rice",
    price: 16.99,
    imageUrl:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
    categorySlug: "mains",
    dietary: ["vegan", "gluten-free"],
    spiceLevel: 3,
    prepTime: 20,
    allergens: [],
    isPopular: true,
    rating: 4.7,
    reviewCount: 156,
  },
  {
    name: "Chocolate Lava Cake",
    description:
      "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 8.99,
    imageUrl:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
    categorySlug: "desserts",
    dietary: ["vegetarian"],
    prepTime: 12,
    allergens: ["gluten", "dairy", "eggs"],
    isPopular: true,
    rating: 4.9,
    reviewCount: 203,
  },
];

const seed = async () => {
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.user.deleteMany();

  await prisma.menuCategory.createMany({
    data: categories.filter((cat) => cat.slug !== "all"),
  });

  const savedCategories = await prisma.menuCategory.findMany();
  const categoryMap = Object.fromEntries(
    savedCategories.map((cat) => [cat.slug, cat.id])
  );

  await prisma.menuItem.createMany({
    data: menuItems.map((item) => ({
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      dietary: item.dietary,
      allergens: item.allergens,
      spiceLevel: item.spiceLevel,
      prepTime: item.prepTime,
      isPopular: item.isPopular,
      rating: item.rating,
      reviewCount: item.reviewCount,
      categoryId: categoryMap[item.categorySlug],
    })),
  });

  const [customerHash, adminHash, staffHash] = await Promise.all([
    hashPassword("customer123"),
    hashPassword("admin123"),
    hashPassword("staff123"),
  ]);

  const customer = await prisma.user.create({
    data: {
      email: "customer@tastebite.com",
      passwordHash: customerHash,
      firstName: "Customer",
      lastName: "Sample",
      role: "CUSTOMER",
      carts: {
        create: [{}],
      },
    },
  });

  await prisma.user.createMany({
    data: [
      {
        email: "admin@tastebite.com",
        passwordHash: adminHash,
        firstName: "Admin",
        lastName: "Sample",
        role: "ADMIN",
      },
      {
        email: "staff@tastebite.com",
        passwordHash: staffHash,
        firstName: "Staff",
        lastName: "Sample",
        role: "STAFF",
      },
    ],
  });

  await prisma.analyticsEvent.createMany({
    data: [
      { type: "ORDER_CREATED", data: { amount: 45.5 } },
      { type: "CUSTOMER_LOGIN", data: { email: customer.email } },
    ],
  });

  console.log("Seed complete");
};

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

