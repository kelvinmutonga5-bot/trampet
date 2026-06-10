export const restaurants = [
  {
    id: 1, name: "Mama's Kitchen", city: "Nairobi", area: "Westlands", category: "Kenyan",
    rating: 4.8, reviews: 312, deliveryTime: "20–35 min", deliveryFee: 80, minOrder: 200,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
    open: true, tags: ["Local favourite", "Family meals"],
    description: "Authentic Kenyan home cooking — nyama choma, ugali, sukuma wiki and more.",
    menu: [
      { id: 101, name: "Nyama Choma (500g)", price: 650, category: "Mains", desc: "Slow-roasted goat with kachumbari", popular: true },
      { id: 102, name: "Ugali & Sukuma Wiki", price: 180, category: "Mains", desc: "Classic maize ugali with sautéed kale", popular: true },
      { id: 103, name: "Githeri Special", price: 220, category: "Mains", desc: "Mixed beans and maize with a touch of spice" },
      { id: 104, name: "Pilau Rice", price: 280, category: "Mains", desc: "Spiced Swahili-style pilau with beef" },
      { id: 105, name: "Mutura (Kenyan Sausage)", price: 150, category: "Snacks", desc: "Grilled traditional sausage, two pieces" },
      { id: 106, name: "Mandazi (3 pcs)", price: 80, category: "Snacks", desc: "Freshly fried Swahili doughnuts" },
      { id: 107, name: "Chai Masala", price: 60, category: "Drinks", desc: "Spiced milk tea" },
      { id: 108, name: "Fresh Passion Juice", price: 120, category: "Drinks", desc: "Blended fresh passionfruit" },
    ]
  },
  {
    id: 2, name: "Burger Republic", city: "Nairobi", area: "Karen", category: "Burgers",
    rating: 4.6, reviews: 198, deliveryTime: "25–40 min", deliveryFee: 100, minOrder: 300,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    open: true, tags: ["Best burgers", "Late night"],
    description: "Smash burgers, crispy fries, thick shakes. No shortcuts.",
    menu: [
      { id: 201, name: "Classic Smash Burger", price: 580, category: "Burgers", desc: "Double smash patty, cheese, pickles, special sauce", popular: true },
      { id: 202, name: "Chicken Crunch Burger", price: 520, category: "Burgers", desc: "Crispy fried chicken, coleslaw, sriracha mayo", popular: true },
      { id: 203, name: "Mushroom Swiss Burger", price: 620, category: "Burgers", desc: "Beef patty, sautéed mushrooms, Swiss cheese" },
      { id: 204, name: "Veggie Stack", price: 480, category: "Burgers", desc: "Black bean patty, avocado, grilled peppers" },
      { id: 205, name: "Loaded Fries", price: 280, category: "Sides", desc: "Fries with cheese sauce, jalapeños, bacon" },
      { id: 206, name: "Onion Rings", price: 220, category: "Sides", desc: "Beer-battered golden rings" },
      { id: 207, name: "Vanilla Milkshake", price: 320, category: "Drinks", desc: "Thick hand-spun vanilla shake" },
      { id: 208, name: "Mango Milkshake", price: 320, category: "Drinks", desc: "Fresh mango blended with ice cream" },
    ]
  },
  {
    id: 3, name: "Swahili Spice", city: "Mombasa", area: "Old Town", category: "Seafood",
    rating: 4.9, reviews: 445, deliveryTime: "30–45 min", deliveryFee: 90, minOrder: 400,
    image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80",
    open: true, tags: ["Coastal cuisine", "Fresh catch"],
    description: "Fresh fish, prawns and octopus prepared the Swahili way.",
    menu: [
      { id: 301, name: "Grilled Whole Fish", price: 850, category: "Mains", desc: "Fresh tilapia with tamarind sauce", popular: true },
      { id: 302, name: "Prawn Coconut Curry", price: 950, category: "Mains", desc: "Tiger prawns in rich coconut curry", popular: true },
      { id: 303, name: "Octopus Stew", price: 780, category: "Mains", desc: "Slow-cooked octopus with coastal spices" },
      { id: 304, name: "Biryani ya Samaki", price: 680, category: "Mains", desc: "Coastal fish biryani with raita" },
      { id: 305, name: "Coconut Rice", price: 180, category: "Sides", desc: "Fragrant coconut-infused basmati" },
      { id: 306, name: "Madafu (Coconut Water)", price: 100, category: "Drinks", desc: "Fresh green coconut" },
      { id: 307, name: "Tamarind Juice", price: 120, category: "Drinks", desc: "Sweet and tangy fresh tamarind" },
    ]
  },
  {
    id: 4, name: "Pizza Palace", city: "Nairobi", area: "Kilimani", category: "Pizza",
    rating: 4.5, reviews: 276, deliveryTime: "25–40 min", deliveryFee: 100, minOrder: 500,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
    open: true, tags: ["Wood-fired", "Family size"],
    description: "Wood-fired Neapolitan-style pizzas with local ingredients.",
    menu: [
      { id: 401, name: "Margherita", price: 680, category: "Pizzas", desc: "San Marzano tomato, buffalo mozzarella, fresh basil", popular: true },
      { id: 402, name: "Nyama Choma Pizza", price: 850, category: "Pizzas", desc: "Roasted goat, caramelised onions, kachumbari", popular: true },
      { id: 403, name: "Pepperoni Classic", price: 820, category: "Pizzas", desc: "Generous pepperoni, mozzarella" },
      { id: 404, name: "Veggie Supreme", price: 760, category: "Pizzas", desc: "Roasted peppers, mushrooms, olives" },
      { id: 405, name: "Garlic Bread", price: 220, category: "Sides", desc: "Toasted with garlic butter and herbs" },
      { id: 406, name: "Tiramisu", price: 280, category: "Desserts", desc: "Classic Italian dessert, made in-house" },
      { id: 407, name: "Soft Drink (350ml)", price: 100, category: "Drinks", desc: "Coke, Sprite or Fanta" },
    ]
  },
  {
    id: 5, name: "Spice Garden", city: "Kisumu", area: "Milimani", category: "Indian",
    rating: 4.7, reviews: 189, deliveryTime: "30–50 min", deliveryFee: 80, minOrder: 350,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
    open: true, tags: ["Vegetarian-friendly", "Authentic Indian"],
    description: "Rich curries, tandoori dishes and fresh naan.",
    menu: [
      { id: 501, name: "Butter Chicken", price: 620, category: "Mains", desc: "Creamy tomato-based chicken curry", popular: true },
      { id: 502, name: "Paneer Tikka Masala", price: 580, category: "Mains", desc: "Chargrilled cottage cheese in spiced sauce", popular: true },
      { id: 503, name: "Lamb Rogan Josh", price: 680, category: "Mains", desc: "Slow-cooked Kashmiri lamb curry" },
      { id: 504, name: "Dal Makhani", price: 420, category: "Mains", desc: "Black lentils slow-cooked overnight" },
      { id: 505, name: "Garlic Naan", price: 120, category: "Breads", desc: "Tandoor-baked with garlic butter" },
      { id: 506, name: "Mango Lassi", price: 180, category: "Drinks", desc: "Yoghurt and mango blended drink" },
    ]
  },
  {
    id: 6, name: "Green Bowl", city: "Nairobi", area: "Lavington", category: "Healthy",
    rating: 4.6, reviews: 143, deliveryTime: "20–30 min", deliveryFee: 100, minOrder: 400,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    open: false, tags: ["Vegan options", "Calorie counts"],
    description: "Salads, smoothie bowls and wraps. Always fresh.",
    menu: [
      { id: 601, name: "Acai Power Bowl", price: 680, category: "Bowls", desc: "Acai, banana, granola, honey, berries", popular: true },
      { id: 602, name: "Grain & Greens Bowl", price: 620, category: "Bowls", desc: "Quinoa, kale, sweet potato, tahini", popular: true },
      { id: 603, name: "Grilled Chicken Salad", price: 580, category: "Salads", desc: "Mixed greens, cherry tomato, avocado" },
      { id: 604, name: "Green Smoothie", price: 380, category: "Drinks", desc: "Spinach, apple, ginger, cucumber" },
    ]
  },
];
