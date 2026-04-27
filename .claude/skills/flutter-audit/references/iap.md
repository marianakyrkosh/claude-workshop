# In-App Purchases Checklist

## RevenueCat Integration

### SDK Setup
- Is the RevenueCat SDK (`purchases_flutter`) initialized early in the app lifecycle (before any UI that shows purchase options)? Late initialization means entitlement checks return empty/default state, and users may see free-tier UI despite having a subscription.
- Is `Purchases.configure()` called with the correct API key for each platform (separate keys for iOS and Android)? Using the wrong key means purchases go to the wrong RevenueCat project — revenue tracking breaks silently.
- Is `appUserID` set to match the authenticated user's identity? If using anonymous IDs, is the transfer/aliasing behavior understood? Without proper user identification, purchases made on one device don't show up on another, and subscription entitlements get lost on logout/login.
- Is `Purchases.setLogLevel` set appropriately (verbose for debug builds, error/none for release)?

### User Identity
- When a user logs in, is `Purchases.logIn(appUserId)` called? Without this, RevenueCat can't associate purchases with the authenticated user — restore fails, cross-device doesn't work.
- When a user logs out, is `Purchases.logOut()` called? Without this, the next user who logs in inherits the previous user's entitlements.
- Is the `appUserId` stable and unique? Using a mutable field (like email) as the user ID means a user who changes their email creates a new RevenueCat customer — losing their purchase history.

### Entitlements & Offerings
- Are entitlement checks done via `Purchases.getCustomerInfo()` or the listener, not by checking product IDs directly? Checking product IDs bypasses RevenueCat's entitlement mapping and breaks if products are restructured.
- Is there a `CustomerInfo` listener set up to react to real-time entitlement changes (e.g., subscription renewal, expiration, refund)? Without it, the app only updates entitlement state on launch or explicit fetch.
- Are Offerings fetched and displayed dynamically, or are product IDs hardcoded in the UI? Hardcoded IDs prevent you from running A/B tests or changing pricing from the RevenueCat dashboard without an app update.
- Is there a fallback if Offerings fetch fails (network error, RevenueCat outage)? If the paywall can't load offerings, the user should see a meaningful state — not a blank or crashed screen.

## Purchase Flow

### Initiating Purchases
- Is the purchase flow guarded against double-taps? Without debouncing or a loading state, a user can initiate multiple simultaneous purchases — the store may charge twice, or the second attempt errors in a confusing way.
- Is the purchase flow guarded against unauthenticated users? Can a logged-out user reach the paywall and attempt to buy? If so, the purchase succeeds at the store level but can't be attributed to a user — a support nightmare.
- Are purchase errors handled exhaustively? Common error states: user cancelled, payment pending (e.g., Ask to Buy on iOS, payment methods requiring bank approval), product not found, network error, store unavailable. Each needs a distinct UI response.

### Payment Pending / Deferred
- Does the app handle "payment pending" / deferred transactions? On iOS, Ask to Buy (family sharing) creates a transaction that completes later — the user shouldn't be told the purchase failed. On Android, some payment methods (carrier billing, cash vouchers) have deferred completion.
- When a pending payment completes (possibly while the app is backgrounded or closed), does the app detect it on next launch and update entitlements?

### Restore Purchases
- Is "Restore Purchases" accessible to the user? Apple requires this for apps with subscriptions — missing it is a store rejection reason.
- Does restore correctly call `Purchases.restorePurchases()` and update the UI based on the resulting `CustomerInfo`?
- What happens if restore finds nothing? The user should see a clear "No purchases found" message, not a silent no-op or error.

## Subscription Lifecycle

### Renewal & Expiration
- Is the app checking subscription status on each launch (or on a regular interval), not just at purchase time? Subscriptions expire, renew, get refunded, or enter billing retry — the app needs to reflect the current state.
- Is the `CustomerInfo` listener updating the UI reactively when subscription state changes? A user whose subscription just renewed shouldn't have to restart the app to regain access.
- What happens when a subscription expires? Is the transition from premium to free graceful — features locked, data preserved, clear messaging about re-subscribing?

### Grace Period & Billing Retry
- Does the app respect grace periods? Both Apple and Google offer configurable grace periods where the user retains access while a payment issue is resolved. If the app checks `expirationDate` naively, it may revoke access during a grace period.
- Is billing retry state handled? RevenueCat surfaces this as `billingIssueDetectedAt` on the subscription. The app should show a soft warning ("Update your payment method") rather than hard-revoking access.

### Upgrades, Downgrades, Crossgrades
- If multiple subscription tiers exist, are upgrade/downgrade flows handled? RevenueCat handles proration, but the UI needs to show the correct behavior: immediate upgrade, downgrade at next renewal, etc.
- Are product IDs mapped correctly for both platforms? An iOS subscription product and an Android subscription product for the same tier must map to the same RevenueCat entitlement.

## Server-Side Validation

### Webhook Integration
- Are RevenueCat webhooks configured to notify the backend when subscription events occur (purchase, renewal, cancellation, refund, billing issue)? Without webhooks, the backend only knows about purchases if the app explicitly reports them — and if the app crashes after purchase, the backend never finds out.
- Does the backend validate that webhook events come from RevenueCat (signature verification or IP allowlist)? An unauthenticated webhook endpoint lets anyone grant themselves premium access.
- Is the backend updating user entitlement state based on webhook events, or only trusting the client?

### Receipt Security
- Is the app relying solely on client-side entitlement checks, or does the backend also verify access? Client-only checks can be bypassed on jailbroken/rooted devices.
- If using server-side receipt validation (beyond RevenueCat): are receipts validated against the store's servers (Apple `verifyReceipt` / Google Play Developer API), not just parsed locally?

## Store Compliance

### Apple App Store
- Does the app include a "Restore Purchases" button? Required for all apps with subscriptions or non-consumable IAPs.
- Are subscription terms (duration, price, renewal behavior) clearly displayed before purchase? Apple rejects apps that don't clearly communicate subscription terms.
- Is the privacy policy URL set in App Store Connect? Required for apps with subscriptions.
- Are subscriptions configured as auto-renewable in App Store Connect with the correct pricing and duration?

### Google Play Store
- Are subscription acknowledgements handled? Google Play requires that subscriptions be acknowledged within 3 days — unacknowledged purchases get refunded automatically. RevenueCat handles this, but verify it's working.
- Are product IDs consistent between the Play Console and RevenueCat dashboard?
- Is the Google Play Billing Library version up to date? Google enforces minimum billing library versions — apps using outdated versions get rejected.

## Testing

### Sandbox & Test Accounts
- Are there App Store sandbox accounts configured for iOS testing? Sandbox purchases bypass real payment but exercise the full flow.
- Are there Google Play test tracks or licensed testers configured? Without license testing, Android purchase flows hit real payment methods.
- Is there a way to clear/reset purchase state during development? Without this, testing repeat purchases requires creating new sandbox accounts.
- Are StoreKit configuration files (`.storekit`) present for local iOS testing without an App Store Connect connection?
