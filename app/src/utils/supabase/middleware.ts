// Since Server Components cannot write cookies.
// Need middleware to automatically refresh expired Auth tokens and store them.

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Don't run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: don't remove auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser(); // token refresh.

  if (
    !user &&
    // places to not redirect on.
    request.nextUrl.pathname !== "/" && // Don't redirect on homepage.
    !request.nextUrl.pathname.startsWith("/error")
  ) {
    // no user, respond by redirecting user to home
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: must return the supabaseResponse object as is.
  // If creating new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //.   const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies.
  // 4. Finally:
  //   return myNewResponse
  // If this is not done, you may cause the browser + server to go out
  // of sync and terminate the user's session prematurely

  return supabaseResponse;
}
