import { useState } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import RestaurantGrid from "./components/RestaurantGrid";
import RestaurantPage from "./pages/RestaurantPage";
import CartDrawer from "./components/CartDrawer";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import { restaurants } from "./data/restaurants";

export default function App() {
  const [page, setPage] = useState("home"); // home | restaurant | checkout | confirmation
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  function addToCart(item, restaurant) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
    });
  }

  function removeFromCart(itemId) {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing?.qty === 1) return prev.filter(i => i.id !== itemId);
      return prev.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i);
    });
  }

  function openRestaurant(r) {
    setSelectedRestaurant(r);
    setPage("restaurant");
    window.scrollTo(0, 0);
  }

  function placeOrder(details) {
    const o = {
      id: "TRP" + Math.floor(Math.random() * 90000 + 10000),
      items: cart,
      total: cartTotal,
      deliveryFee: 80,
      ...details,
      status: "confirmed",
      eta: "25–40 min",
      placedAt: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })
    };
    setOrder(o);
    setCart([]);
    setPage("confirmation");
    window.scrollTo(0, 0);
  }

  const filteredRestaurants = restaurants.filter(r => {
    const matchCity = cityFilter === "all" || r.city === cityFilter;
    const matchCat = categoryFilter === "all" || r.category === categoryFilter;
    const matchSearch = search === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchCat && matchSearch;
  });

  return (
    <div className="app">
      {page !== "confirmation" && (
        <Header
          cartCount={cartCount}
          cartTotal={cartTotal}
          onCartClick={() => setCartOpen(true)}
          onHome={() => { setPage("home"); setSelectedRestaurant(null); }}
          currentPage={page}
        />
      )}

      {page === "home" && (
        <>
          <HeroSection
            search={search}
            onSearch={setSearch}
            cityFilter={cityFilter}
            onCityFilter={setCityFilter}
            categoryFilter={categoryFilter}
            onCategoryFilter={setCategoryFilter}
          />
          <RestaurantGrid
            restaurants={filteredRestaurants}
            onSelect={openRestaurant}
          />
        </>
      )}

      {page === "restaurant" && selectedRestaurant && (
        <RestaurantPage
          restaurant={selectedRestaurant}
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onBack={() => setPage("home")}
          onCheckout={() => { setCartOpen(false); setPage("checkout"); }}
        />
      )}

      {page === "checkout" && (
        <CheckoutPage
          cart={cart}
          total={cartTotal}
          onBack={() => setPage("restaurant")}
          onPlace={placeOrder}
        />
      )}

      {page === "confirmation" && order && (
        <OrderConfirmation
          order={order}
          onHome={() => { setPage("home"); setOrder(null); }}
        />
      )}

      <CartDrawer
        open={cartOpen}
        cart={cart}
        total={cartTotal}
        onClose={() => setCartOpen(false)}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onCheckout={() => { setCartOpen(false); setPage("checkout"); window.scrollTo(0,0); }}
      />
    </div>
  );
}
