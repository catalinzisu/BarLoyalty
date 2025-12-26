import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  // Skip adding Authorization header for login and register endpoints
  const urlLowerCase = request.url.toLowerCase();
  const isLoginEndpoint = urlLowerCase.includes('/auth/login');
  const isRegisterEndpoint = urlLowerCase.includes('/auth/register');
  const isAuthEndpoint = isLoginEndpoint || isRegisterEndpoint;
  
  if (isAuthEndpoint) {
    console.log('[Auth Interceptor] Skipping Authorization header for auth endpoint:', request.url);
    return next(request.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    }));
  }

  // For all other authenticated requests, add JWT Bearer token if user is logged in
  const token = localStorage.getItem('token');
  
  let authenticatedRequest = request;

  if (token) {
    console.log('[Auth Interceptor] Adding JWT Bearer token for authenticated request');
    console.log('[Auth Interceptor] Request URL:', request.url);

    authenticatedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } else {
    // No token available, just add Content-Type header
    console.log('[Auth Interceptor] No token found, sending unauthenticated request');
    authenticatedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  console.log(
    '[Auth Interceptor] Final request - URL:', 
    authenticatedRequest.url, 
    '| Has Authorization:', 
    !!authenticatedRequest.headers.get('Authorization')
  );

  return next(authenticatedRequest);
};

