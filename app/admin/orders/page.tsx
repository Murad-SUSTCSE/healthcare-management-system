"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Package, User, Clock, CheckCircle, Truck, XCircle } from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  medicine: {
    id: number;
    name: string;
    description: string;
    price: number;
  };
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  orderItems: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllMedicineOrders();
      setOrders(data as unknown as Order[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: number) => {
    try {
      await apiService.updateMedicineOrderStatus(orderId, "DELIVERED");
      toast({
        title: "Success",
        description: "Order marked as delivered",
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await apiService.updateMedicineOrderStatus(orderId, "CANCELLED");
      toast({
        title: "Success",
        description: "Order cancelled",
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "SHIPPED"
  );
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "CONFIRMED":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case "SHIPPED":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800"><Truck className="w-3 h-3 mr-1" />Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const OrderCard = ({ order, showActions }: { order: Order; showActions: boolean }) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order #{order.id}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(order.createdAt)}
            </p>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent>
        {/* Customer Info */}
        <div className="bg-muted/50 p-3 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4" />
            <span className="font-medium">Customer Details</span>
          </div>
          <div className="text-sm space-y-1 ml-6">
            <p><strong>Name:</strong> {order.user.name}</p>
            <p><strong>Email:</strong> {order.user.email}</p>
            {order.user.phone && <p><strong>Phone:</strong> {order.user.phone}</p>}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2 mb-4">
          <p className="font-medium">Items:</p>
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded">
              <div>
                <span className="font-medium">{item.medicine.name}</span>
                <span className="text-muted-foreground ml-2">x{item.quantity}</span>
              </div>
              <span>৳{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center font-bold text-lg border-t pt-3">
          <span>Total:</span>
          <span className="text-primary">৳{order.total.toFixed(2)}</span>
        </div>

        {/* Actions */}
        {showActions && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => handleMarkDelivered(order.id)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Delivered
            </Button>
            <Button
              onClick={() => handleCancelOrder(order.id)}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Medicine Orders</h1>
        <p className="text-muted-foreground">Manage and track customer medicine orders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Active ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Delivered ({deliveredOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Cancelled ({cancelledOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-medium">No active orders</p>
                <p className="text-muted-foreground">Active orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} showActions={true} />
            ))
          )}
        </TabsContent>

        <TabsContent value="delivered">
          {deliveredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-medium">No delivered orders</p>
                <p className="text-muted-foreground">Delivered orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            deliveredOrders.map((order) => (
              <OrderCard key={order.id} order={order} showActions={false} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {cancelledOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-medium">No cancelled orders</p>
                <p className="text-muted-foreground">Cancelled orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            cancelledOrders.map((order) => (
              <OrderCard key={order.id} order={order} showActions={false} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
