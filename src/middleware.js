import {NextResponse} from 'next/server'
import {auth} from "@/lib/auth";
import {getToken} from "next-auth/jwt"

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
    // 获取session
    const session = await auth()
    // const token = await getToken({ req: request, secret: '123456' })
    console.log("request.nextUrl.pathname=", request.nextUrl.pathname)
    // 1、如果登录了就不能跳转到登录页面，
    // 2、我的笔记、文件、chatAI、imageAi页面没有登录就必须跳转到登录页面
    if (session?.user) {
        // 1、如果登录了或者注册了就不能跳转到登录或者注册页面，
        if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // 注意：把验证邮箱修改密码等页面过滤，已登录的不能跳转到这些页面
        if (request.nextUrl.pathname.includes('/update_email_verification')) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // 注意：把验证邮箱修改密码等页面过滤，已登录的不能跳转到这些页面
        if (request.nextUrl.pathname.includes('/password_reset')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    } else {
        if (request.nextUrl.pathname.startsWith('/aiSpace')
            || request.nextUrl.pathname.startsWith('/fileSpace')
            ||request.nextUrl.pathname.startsWith('/noteSpace')
            ||request.nextUrl.pathname.startsWith('/setting')
            || request.nextUrl.pathname.startsWith('/square')
            || request.nextUrl.pathname.startsWith('/news')
            || request.nextUrl.pathname.startsWith('/chatroom')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // else{
    //     if (!request.nextUrl.pathname.startsWith('/login')){
    //         return NextResponse.redirect(new URL('/login', request.url))
    //     }
    // }
    // return NextResponse.redirect(new URL('/', request.url))
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/', '/login', '/register', '/square', '/news', '/chatroom', '/setting/:path*', '/account/:path*', '/fileSpace', '/noteSpace', '/aiSpace/:path*'],
}
