import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CatalogScreen } from '../screens/catalog/CatalogScreen';
import { SearchScreen } from '../screens/catalog/SearchScreen';
import { ProductDetailScreen } from '../screens/catalog/ProductDetailScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrderHistoryScreen } from '../screens/orders/OrderHistoryScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const OrderStack = createNativeStackNavigator();

const HomeStackScreen: React.FC = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Home' }} />
    <HomeStack.Screen name="Catalog" component={CatalogScreen} />
    <HomeStack.Screen name="Search" component={SearchScreen} />
    <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
  </HomeStack.Navigator>
);

const CartStackScreen: React.FC = () => (
  <CartStack.Navigator>
    <CartStack.Screen name="CartMain" component={CartScreen} options={{ title: 'My Cart' }} />
    <CartStack.Screen name="Checkout" component={CheckoutScreen} />
  </CartStack.Navigator>
);

const OrderStackScreen: React.FC = () => (
  <OrderStack.Navigator>
    <OrderStack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'Orders' }} />
    <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
  </OrderStack.Navigator>
);

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Cart" component={CartStackScreen} />
      <Tab.Screen name="Orders" component={OrderStackScreen} />
    </Tab.Navigator>
  );
};
