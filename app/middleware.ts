import { NextRequest, NextResponse } from "next/server";
// import { updateSession } from "./src/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // uses middleware function for Supabase
  // return await updateSession(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimisation files)
     * - favicon.ico (favicon file)
     * - api (API routes) <- must be excluded TODO: may want to select API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
