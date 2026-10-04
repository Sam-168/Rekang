import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './components/auth/AuthLayout'
import { AppShell } from './components/app/AppShell'
import { MarketplaceProvider } from './context/MarketplaceProvider'
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
import './App.css'

function App() {
  return (
    <MarketplaceProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signup/role" element={<RoleSelectionPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route element={<AppShell />}>
          <Route path="/home" element={<MarketplacePage />} />
          <Route path="/filters" element={<FiltersPage />} />
          <Route path="/listings/new" element={<ListingEditorPage />} />
          <Route path="/listings/:listingId" element={<ListingDetailPage />} />
          <Route path="/listings/:listingId/edit" element={<ListingEditorPage />} />
          <Route path="/sellers/:sellerId" element={<SellerProfilePage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/community" element={<ComingSoon section="Community board" />} />
        </Route>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:orderId/confirmation" element={<OrderConfirmationPage />} />
        <Route path="/orders/:orderId/review" element={<ReviewPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </MarketplaceProvider>
  )
}

function ComingSoon({ section = 'Marketplace' }: { section?: string }) {
  return (
    <main className="coming-soon">
      <a className="brand" href="/login" aria-label="Rekang home">rekang.</a>
      <p className="eyebrow">Next build batch</p>
      <h1>{section} is coming next.</h1>
      <p>This route is ready for its Controlled screen implementation.</p>
      <a className="button button--primary" href="/home">Back to marketplace</a>
    </main>
  )
}

export default App
