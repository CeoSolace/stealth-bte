export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/matches/:path*',
    '/shop',
    '/withdraw',
    '/friends/:path*',
    '/admin/:path*'
  ]
}
