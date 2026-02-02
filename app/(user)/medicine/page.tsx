'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MedicineCard } from '@/components/MedicineCard';
import { Search, ShoppingCart, Pill, Loader2, Package, Clock, CheckCircle, MapPin, Phone, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { Medicine, CartItem } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function MedicinePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState('');
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('shop');
  const { toast } = useToast();
  const { user } = useAuth();

  // Delivery info modal state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    phone: user?.phone || '',
  });

  // Fetch medicines from API
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getMedicines();
        setMedicines(data);
        setFilteredMedicines(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load medicines');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const orders = await apiService.getMyMedicineOrders();
          setMyOrders(orders);
        } catch (err) {
          console.error('Failed to fetch orders:', err);
        }
      }
    };

    fetchOrders();
  }, [user]);

  // Get unique categories (filter out undefined/null)
  const categories = ['all', ...new Set(medicines.map((m) => m.category).filter(Boolean))];

  useEffect(() => {
    let filtered = medicines;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    setFilteredMedicines(filtered);
  }, [searchTerm, selectedCategory, medicines]);

  const handleAddToCart = (medicine: Medicine, quantity: number) => {
    const existingItem = cartItems.find((item) => item.medicine.id === medicine.id);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { medicine, quantity }]);
    }
  };

  const handleRemoveFromCart = (medicineId: string) => {
    setCartItems(cartItems.filter((item) => item.medicine.id !== medicineId));
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart first",
        variant: "destructive",
      });
      return;
    }

    // Show delivery info modal
    setDeliveryInfo({
      address: '',
      phone: user?.phone || '',
    });
    setShowDeliveryModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!deliveryInfo.address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your delivery address",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryInfo.phone.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsOrdering(true);
      const items = cartItems.map((item) => ({
        medicineId: parseInt(item.medicine.id),
        quantity: item.quantity,
      }));
      
      await apiService.createMedicineOrder(items, deliveryInfo.address, deliveryInfo.phone);
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and will be delivered soon.",
      });
      
      // Clear cart and refresh orders
      setCartItems([]);
      setShowDeliveryModal(false);
      const orders = await apiService.getMyMedicineOrders();
      setMyOrders(orders);
      setActiveTab('orders');
    } catch (err: any) {
      toast({
        title: "Order Failed",
        description: err.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.medicine.price * item.quantity,
    0
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'DELIVERED':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeOrders = myOrders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const pastOrders = myOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Order Medicine</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and order medicines for delivery to your home
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            My Orders ({myOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop">
          {/* Search and Filter */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Medicines Grid */}
            <div className="lg:col-span-3 space-y-6">
              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: 'Total Medicines',
                    value: filteredMedicines.length,
                    icon: Pill,
                    color: 'blue',
                  },
                  {
                    label: 'In Stock',
                    value: filteredMedicines.filter((m) => m.inStock).length,
                    icon: Pill,
                    color: 'green',
                  },
                  {
                    label: 'Categories',
                    value: categories.length - 1,
                    icon: Pill,
                    color: 'orange',
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  const colorClasses = {
                    blue: 'bg-blue-100 text-blue-600',
                    green: 'bg-green-100 text-green-600',
                    orange: 'bg-orange-100 text-orange-600',
                  };

                  return (
                    <Card key={stat.label} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="mt-1 text-2xl font-bold text-foreground">
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            colorClasses[stat.color as keyof typeof colorClasses]
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Medicines Grid */}
              {filteredMedicines.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMedicines.map((medicine) => {
                    const itemInCart = cartItems.find(
                      (item) => item.medicine.id === medicine.id
                    );
                    return (
                      <MedicineCard
                        key={medicine.id}
                        medicine={medicine}
                        quantity={itemInCart?.quantity || 0}
                        onAddToCart={handleAddToCart}
                      />
                    );
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Pill className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-lg text-muted-foreground">
                    No medicines found
                  </p>
                </Card>
              )}
            </div>

            {/* Cart Sidebar */}
            <Card className="h-fit sticky top-4 p-6 bg-gradient-to-br from-blue-50 to-green-50 border-2">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Shopping Cart</h2>
              </div>

              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.medicine.id}
                        className="rounded-lg bg-white p-3 text-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-foreground line-clamp-1">
                              {item.medicine.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              ৳{item.medicine.price * item.quantity}
                            </p>
                            <button
                              onClick={() => handleRemoveFromCart(item.medicine.id)}
                              className="text-xs text-red-500 hover:underline mt-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Subtotal</span>
                      <span className="font-semibold text-foreground">৳{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Delivery</span>
                      <span className="font-semibold text-foreground">৳50</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="text-xl font-bold text-primary">
                        ৳{(totalPrice + 50).toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      className="w-full rounded-lg mt-4" 
                      onClick={handleBuyNow}
                      disabled={isOrdering}
                    >
                      {isOrdering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        'Buy Now'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add medicines to get started
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-6">
            {/* Active Orders */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Active Orders
              </h2>
              {activeOrders.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">No active orders</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-BD', {
                              dateStyle: 'medium',
                            })}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="space-y-2">
                        {order.orderItems?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.medicine?.name} x{item.quantity}</span>
                            <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary">৳{order.total?.toFixed(2)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Past Orders */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Past Orders
              </h2>
              {pastOrders.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">No past orders</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastOrders.map((order) => (
                    <Card key={order.id} className="p-4 opacity-75">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-BD', {
                              dateStyle: 'medium',
                            })}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="space-y-2">
                        {order.orderItems?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.medicine?.name} x{item.quantity}</span>
                            <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary">৳{order.total?.toFixed(2)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delivery Info Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delivery Information</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeliveryModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Please provide your delivery details to complete your order.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  Delivery Address
                </label>
                <Input
                  value={deliveryInfo.address}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                  placeholder="Enter your full delivery address"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4 text-primary" />
                  Phone Number
                </label>
                <Input
                  value={deliveryInfo.phone}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-2">Order Summary</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Items ({totalItems})</span>
                    <span>৳{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">৳{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600"
                  onClick={handleConfirmOrder}
                  disabled={isOrdering || !deliveryInfo.address || !deliveryInfo.phone}
                >
                  {isOrdering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing Order...
                    </>
                  ) : (
                    'Confirm Order'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeliveryModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
