// src/app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userToken = request.cookies.get('userToken'); // หรือใช้ localStorage สำหรับการตรวจสอบสถานะการล็อกอิน

    // ถ้าผู้ใช้ล็อกอินอยู่
    if (userToken) {
        const url = request.nextUrl.clone();

        // ถ้าพยายามเข้าถึง /login หรือ /register
        if (url.pathname === '/login' || url.pathname === '/register') {
            url.pathname = '/'; // เปลี่ยนเส้นทางไปยังหน้าโฮม
            return NextResponse.redirect(url);
        }
    }
    return NextResponse.next();
}

// ตั้งค่า middleware ให้ทำงานกับเส้นทางที่กำหนด
export const config = {
    matcher: ['/login', '/register'], // กำหนดเส้นทางที่ต้องการตรวจสอบ
};
