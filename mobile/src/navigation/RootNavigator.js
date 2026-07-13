import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BarChart3, CreditCard, Home, LayoutDashboard, Package, ReceiptText, Search, ShoppingCart, User } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { colors } from "../theme/colors";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import HomeScreen from "../screens/user/HomeScreen";
import SearchScreen from "../screens/user/SearchScreen";
import CartScreen from "../screens/user/CartScreen";
import OrdersScreen from "../screens/user/OrdersScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import MasterDashboardScreen from "../screens/admin/MasterDashboardScreen";
import ProductManagementScreen from "../screens/admin/ProductManagementScreen";
import InventoryScreen from "../screens/admin/InventoryScreen";
import OrderManagementScreen from "../screens/admin/OrderManagementScreen";
import SalesDashboardScreen from "../screens/admin/SalesDashboardScreen";
import PaymentManagementScreen from "../screens/admin/PaymentManagementScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function UserTabs() {
  const { items } = useCart();
  const cartQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tabs.Navigator screenOptions={{ tabBarActiveTintColor: colors.green, headerShown: false }}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Home color={color} size={21} /> }} />
      <Tabs.Screen name="Search" component={SearchScreen} options={{ tabBarIcon: ({ color }) => <Search color={color} size={21} /> }} />
      <Tabs.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color }) => <ShoppingCart color={color} size={21} />,
          tabBarBadge: cartQuantity || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.green, color: colors.white }
        }}
      />
      <Tabs.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: ({ color }) => <ReceiptText color={color} size={21} /> }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <User color={color} size={21} /> }} />
    </Tabs.Navigator>
  );
}

function MasterTabs() {
  return (
    <Tabs.Navigator screenOptions={{ tabBarActiveTintColor: colors.green, headerShown: false }}>
      <Tabs.Screen name="Dashboard" component={MasterDashboardScreen} options={{ tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={21} /> }} />
      <Tabs.Screen name="Products" component={ProductManagementScreen} options={{ tabBarIcon: ({ color }) => <Package color={color} size={21} /> }} />
      <Tabs.Screen name="Inventory" component={InventoryScreen} options={{ tabBarIcon: ({ color }) => <Package color={color} size={21} /> }} />
      <Tabs.Screen name="Orders" component={OrderManagementScreen} options={{ tabBarIcon: ({ color }) => <ReceiptText color={color} size={21} /> }} />
      <Tabs.Screen name="Payments" component={PaymentManagementScreen} options={{ tabBarIcon: ({ color }) => <CreditCard color={color} size={21} /> }} />
      <Tabs.Screen name="Sales" component={SalesDashboardScreen} options={{ tabBarIcon: ({ color }) => <BarChart3 color={color} size={21} /> }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user?.role === "master") {
    return <MasterTabs />;
  }

  if (user?.role === "user") {
    return <UserTabs />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
