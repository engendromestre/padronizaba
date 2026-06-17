import { NextResponse } from "next/server"
import { auth } from "./lib/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl

    const isPublica = pathname === "/login"
        || pathname.startsWith("/login/")
        || pathname.startsWith("/convite")

    if (!isLoggedIn && !isPublica) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    if (isLoggedIn && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }
})

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons).*)",
    ],
}