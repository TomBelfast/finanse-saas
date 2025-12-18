/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Redirect, Route, RouteProps, useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AppStore, RequestStatus, UserStatus } from '@akademiasaas/shared'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

// eslint-disable-next-line no-console
console.log('[ProtectedRoute] DEBUG ENV:', import.meta.env.VITE_DEBUG)

const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

const ProtectedRoute = ({ component: Component, render, ...rest }: RouteProps) => {
  const { isSignedIn, isLoaded } = useAuth()
  const {
    data: user,
    status,
    detailsStatus,
    details,
  } = useSelector((store: AppStore) => store.user)
  const history = useHistory()
  const continuePath = history.location.pathname + history.location.search

  if (!Component && !render) {
    throw new Error('Component or render prop is required')
  }
  const authPath = `/auth/login?continue=${encodeURIComponent(continuePath)}`

  const isLoggingIn = status === UserStatus.LOGGING_IN
  const isLoadingDetails = detailsStatus === RequestStatus.FETCHING

  if (import.meta.env.VITE_DEBUG === 'true') {
    // eslint-disable-next-line no-console
    console.debug('[ProtectedRoute] Status', {
      isLoggingIn,
      isLoadingDetails,
      status,
      detailsStatus,
      user,
      details,
    })
  }

  if (!isLoaded) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      // eslint-disable-next-line no-console
      console.debug('[ProtectedRoute] Clerk loading')
    }
    return <LoadingSpinner />
  }

  if (isLoggingIn || isLoadingDetails) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      // eslint-disable-next-line no-console
      console.debug('[ProtectedRoute] Loading')
    }
    return <LoadingSpinner />
  }

  // Check Clerk authentication status (not Redux user state)
  // Redux user might not be synced yet, but Clerk auth is sufficient
  if (!isSignedIn) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      // eslint-disable-next-line no-console
      console.debug('[ProtectedRoute] Redirect to auth - not signed in', { isSignedIn, user })
    }
    return <Redirect to={authPath} />
  }

  const handleError = (error: Error): React.ReactElement => {
    // eslint-disable-next-line no-console
    console.error('[ProtectedRoute] Error', error)
    return <div>Error: {error.message}</div>
  }

  return (
    <Route
      {...rest}
      render={(props): React.ReactElement => {
        try {
          if (render) {
            return render(props) as React.ReactElement
          }
          if (Component) {
            return <Component {...props} />
          }
          throw new Error('Component or render prop is required')
        } catch (error) {
          if (import.meta.env.VITE_DEBUG === 'true') {
            // eslint-disable-next-line no-console
            console.debug('[ProtectedRoute] Error in render', error)
          }
          return handleError(error instanceof Error ? error : new Error(String(error)))
        }
      }}
    />
  )
}

export default ProtectedRoute

// Deklaracja globalna dla debugowania
declare global {
  interface Window {
    _debug_protectedRoute?: any
    _debug_protectedRouteRender?: any
  }
}
