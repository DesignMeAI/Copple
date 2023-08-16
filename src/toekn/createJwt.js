import { generateSecret, SignJWT } from 'jose';

const secretKey = generateSecret("HS256"); // HS256 암호화 알고리즘 사용

export async function createJwt() {
    return new SignJWT({ "urn:example:claim": true })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer("urn:example:issuer")
        .setAudience("urn:example:audience")
        .setExpirationTime("2h")
        .sign(await secretKey);
}