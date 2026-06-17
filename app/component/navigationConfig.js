import {
  LayoutDashboard,
  Grid3X3,
  Menu as MenuIcon,
  Percent,
  ShoppingBag,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Mail,
} from 'lucide-react';

export const adminNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-indigo-600', href: '/' },
  { id: 'categories', label: 'Categories', icon: Grid3X3, gradient: 'from-emerald-500 to-teal-600', href: '/categories' },
  { id: 'menu-items', label: 'Menu Items', icon: MenuIcon, gradient: 'from-orange-500 to-red-600', href: '/menu-items' },
  { id: 'offers', label: 'Offers', icon: Percent, gradient: 'from-purple-500 to-pink-600', href: '/offer' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, gradient: 'from-cyan-500 to-blue-600', href: '/orders' },
  { id: 'promotions', label: 'Promotions', icon: Mail, gradient: 'from-fuchsia-500 to-purple-600', href: '/promotions' },
  { id: 'contact', label: 'Contact', icon: MessageSquare, gradient: 'from-rose-500 to-pink-600', href: '/contact' },
  { id: 'banners', label: 'Banners', icon: ImageIcon, gradient: 'from-indigo-500 to-purple-600', href: '/banners' },
  { id: 'settings', label: 'Settings', icon: Settings, gradient: 'from-gray-500 to-gray-700', href: '/settings' },
];


