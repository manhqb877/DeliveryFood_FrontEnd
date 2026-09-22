import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthGuard } from './AuthGuard';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ShopLayout } from '@/layouts/ShopLayout';

// Auth pages
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterShopPage } from '@/features/auth/RegisterShopPage';
import { PendingApprovalPage } from '@/features/auth/PendingApprovalPage';

// Admin feature pages
import { AdminReportsPage } from '@/features/admin/reports/AdminReportsPage';
import { AccountsPage } from '@/features/admin/accounts/AccountsPage';
import { ShopApprovalsPage } from '@/features/admin/accounts/ShopApprovalsPage';
import { ShipperApprovalsPage } from '@/features/admin/accounts/ShipperApprovalsPage';
import { OrdersMonitorPage } from '@/features/admin/operations/OrdersMonitorPage';
import { ComplaintsPage } from '@/features/admin/operations/ComplaintsPage';
import { FraudAlertsPage } from '@/features/admin/operations/FraudAlertsPage';
import { CommissionPage } from '@/features/admin/commission/CommissionPage';
import { ReconciliationPage } from '@/features/admin/commission/ReconciliationPage';
import { AreasPage } from '@/features/admin/areas/AreasPage';
import { AdminPromotionsPage } from '@/features/admin/promotions/AdminPromotionsPage';

// Shop feature pages
import { ShopRevenuePage } from '@/features/shop/revenue/ShopRevenuePage';
import { ShopProfilePage } from '@/features/shop/profile/ShopProfilePage';
import { CategoriesPage } from '@/features/shop/menu/CategoriesPage';
import { MenuItemsPage } from '@/features/shop/menu/MenuItemsPage';
import { ShopOrdersPage } from '@/features/shop/orders/ShopOrdersPage';
import { ShopShippersPage } from '@/features/shop/shippers/ShopShippersPage';
import { ShopPromotionsPage } from '@/features/shop/promotions/ShopPromotionsPage';
import { ShopReviewsPage } from '@/features/shop/reviews/ShopReviewsPage';

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/login" replace />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register-shop',
        element: <RegisterShopPage />,
      },
      {
        path: '/pending-approval',
        element: <PendingApprovalPage />,
      },
      {
        path: '/admin',
        element: (
          <AuthGuard allowedRoles={['ADMIN']}>
            <AdminLayout />
          </AuthGuard>
        ),
        children: [
          { path: '', element: <Navigate to="/admin/reports" replace /> },
          { path: 'reports', element: <AdminReportsPage /> },
          { path: 'accounts', element: <AccountsPage /> },
          { path: 'shop-approvals', element: <ShopApprovalsPage /> },
          { path: 'shipper-approvals', element: <ShipperApprovalsPage /> },
          { path: 'orders-monitor', element: <OrdersMonitorPage /> },
          { path: 'complaints', element: <ComplaintsPage /> },
          { path: 'fraud-alerts', element: <FraudAlertsPage /> },
          { path: 'commission', element: <CommissionPage /> },
          { path: 'reconciliation', element: <ReconciliationPage /> },
          { path: 'areas', element: <AreasPage /> },
          { path: 'promotions', element: <AdminPromotionsPage initialTab="PLATFORM" /> },
          { path: 'promotion-approvals', element: <AdminPromotionsPage initialTab="PENDING_SHOP" /> },
        ],
      },
      {
        path: '/shop',
        element: (
          <AuthGuard allowedRoles={['SHOP_MANAGER']}>
            <ShopLayout />
          </AuthGuard>
        ),
        children: [
          { path: '', element: <Navigate to="/shop/orders" replace /> },
          { path: 'revenue', element: <ShopRevenuePage /> },
          { path: 'profile', element: <ShopProfilePage /> },
          { path: 'menu/categories', element: <CategoriesPage /> },
          { path: 'menu/items', element: <MenuItemsPage /> },
          { path: 'orders', element: <ShopOrdersPage /> },
          { path: 'shippers', element: <ShopShippersPage /> },
          { path: 'promotions', element: <ShopPromotionsPage /> },
          { path: 'reviews', element: <ShopReviewsPage /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);
