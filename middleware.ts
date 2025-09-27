import { withAuth } from "next-auth/middleware";
import { redirect } from "next/dist/server/api-utils";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes
export const config = {
  matcher: ["/", "/dashboard/:path*", "/settings/:path*"],
};
