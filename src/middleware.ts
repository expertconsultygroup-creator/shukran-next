import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = /^\/(ar|en)?\/?admin/.test(pathname);
  const isLoginRoute = /^\/(ar|en)?\/?admin\/login/.test(pathname);

  // For admin routes (except login), check auth FIRST before intl
  if (isAdminRoute && !isLoginRoute) {
    let response = NextResponse.next({
      request: { headers: request.headers },
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
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      const localeMatch = pathname.match(/^\/(ar|en)/);
      const localePrefix = localeMatch ? localeMatch[0] : '/ar';
      url.pathname = `${localePrefix}/admin/login`;
      return NextResponse.redirect(url);
    }
  }

  // Handle i18n routing for all requests
  const intlResponse = intlMiddleware(request);

  // For admin routes that passed auth, merge Supabase cookies into intl response
  if (isAdminRoute && !isLoginRoute) {
    const supabase2 = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              intlResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    // Refresh the session so cookies stay alive
    await supabase2.auth.getUser();
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/(ar|en)/:path*']
};
