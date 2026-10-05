import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './components/auth/AuthLayout'
import { GuestOnly, RequireAuth } from './components/auth/AuthGuards'
import { AppShell } from './components/app/AppShell'
import { MarketplaceProvider } from './context/MarketplaceProvider'
import { CommunityProvider } from './context/CommunityProvider'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import { VerificationPage } from './pages/auth/VerificationPage'
import { CartPage } from './pages/marketplace/CartPage'
import { FiltersPage } from './pages/marketplace/FiltersPage'
import { ListingDetailPage } from './pages/marketplace/ListingDetailPage'
import { ListingEditorPage } from './pages/marketplace/ListingEditorPage'
import { MarketplacePage } from './pages/marketplace/MarketplacePage'
import { CheckoutPage } from './pages/orders/CheckoutPage'
import { OrderConfirmationPage } from './pages/orders/OrderConfirmationPage'
import { OrderDetailPage } from './pages/orders/OrderDetailPage'
import { OrderHistoryPage } from './pages/orders/OrderHistoryPage'
import { ReviewPage } from './pages/orders/ReviewPage'
import { SellerProfilePage } from './pages/profile/SellerProfilePage'
import { BulletinBoardPage } from './pages/community/BulletinBoardPage'
import { BulletinPostPage } from './pages/community/BulletinPostPage'
import { CreateBulletinPostPage } from './pages/community/CreateBulletinPostPage'
import { NotificationsPage } from './pages/community/NotificationsPage'
import { ModerationPage } from './pages/admin/ModerationPage'
import './App.css'

function App() {
  return (
    <MarketplaceProvider>
      <CommunityProvider>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signup/role" element={<RoleSelectionPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/home" element={<MarketplacePage />} />
            <Route path="/filters" element={<FiltersPage />} />
            <Route path="/listings/new" element={<ListingEditorPage />} />
            <Route path="/listings/:listingId" element={<ListingDetailPage />} />
            <Route path="/listings/:listingId/edit" element={<ListingEditorPage />} />
            <Route path="/sellers/:sellerId" element={<SellerProfilePage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/community" element={<BulletinBoardPage />} />
            <Route path="/community/new" element={<CreateBulletinPostPage />} />
            <Route path="/community/:postId" element={<BulletinPostPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/admin/moderation" element={<ModerationPage />} />
          </Route>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:orderId/confirmation" element={<OrderConfirmationPage />} />
          <Route path="/orders/:orderId/review" element={<ReviewPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </CommunityProvider>
    </MarketplaceProvider>
  )
}

export default App
