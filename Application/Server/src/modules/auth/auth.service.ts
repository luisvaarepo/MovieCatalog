import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

type User = { id: number; username: string; password: string };

function base64UrlEncode(obj: any) {
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad === 2) str += '==';
  else if (pad === 3) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function signHS256(input: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(input).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

@Injectable()
export class AuthService {
  private users: User[] = [];
  private nextId = 1;
  private readonly secret = process.env.JWT_SECRET || 'demo-jwt-secret';

  constructor() {
    try {
      this.register('user', '12345');
    } catch (e) {
      // ignore
    }
  }

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const found = this.users.find((u) => u.username === username && u.password === password);
    if (!found) return null;
    const { password: _p, ...rest } = found;
    return rest;
  }

  async register(username: string, password: string): Promise<Omit<User, 'password'>> {
    if (this.users.find((u) => u.username === username)) {
      throw new ConflictException('User already exists');
    }
    const user: User = { id: this.nextId++, username, password };
    this.users.push(user);
    const { password: _p, ...rest } = user;
    return rest;
  }

  private signToken(payload: Record<string, any>, expiresInSeconds = 7 * 24 * 3600): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const body = { ...payload, iat: now, exp: now + expiresInSeconds };
    const headerB = base64UrlEncode(header);
    const bodyB = base64UrlEncode(body);
    const toSign = `${headerB}.${bodyB}`;
    const sig = signHS256(toSign, this.secret);
    return `${toSign}.${sig}`;
  }

  private verifySigned(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const [headerB, bodyB, sig] = parts;
    const toSign = `${headerB}.${bodyB}`;
    const expected = signHS256(toSign, this.secret);
    if (sig !== expected) throw new Error('Invalid signature');
    const payload = JSON.parse(base64UrlDecode(bodyB));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) throw new Error('Token expired');
    return payload;
  }

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { username: user.username, sub: user.id };
    return { access_token: this.signToken(payload) };
  }

  async verifyToken(token: string) {
    try {
      return this.verifySigned(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
