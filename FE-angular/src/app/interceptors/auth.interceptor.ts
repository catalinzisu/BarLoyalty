import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const currentUserJson = localStorage.getItem('currentUser');
  
  let authenticatedRequest = request;

  if (currentUserJson) {
    try {
      const currentUser = JSON.parse(currentUserJson);
      
      const username = currentUser.username;
      const password = currentUser.password;

      if (username && password) {
        const encodedCredentials = btoa(`${username}:${password}`);
        
        console.log('[Auth Interceptor] Encoding credentials for user:', username);
        console.log('[Auth Interceptor] Adding Basic Auth to request:', request.url);

        authenticatedRequest = request.clone({
          setHeaders: {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        console.warn('[Auth Interceptor] currentUser exists but missing username or password');
        authenticatedRequest = request.clone({
          setHeaders: {
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('[Auth Interceptor] Error parsing currentUser from localStorage:', error);
      authenticatedRequest = request.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }
  } else {
    authenticatedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  console.log(
    '[Auth Interceptor] Request URL:', 
    authenticatedRequest.url, 
    '| Authorization header set:', 
    !!authenticatedRequest.headers.get('Authorization')
  );

  return next(authenticatedRequest);
};

