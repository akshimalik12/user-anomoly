import { NextResponse } from 'next/server';

const RECAPTCHA_SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'; // Google test key

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
        }

        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`;

        const response = await fetch(verifyUrl, { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'reCAPTCHA verification failed' });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
