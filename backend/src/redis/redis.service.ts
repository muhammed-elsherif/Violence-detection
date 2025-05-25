// import { Injectable } from '@nestjs/common';
// import { createClient } from 'redis';

// @Injectable()
// export class RedisService {
//   private client;

//   constructor() {
//     this.client = createClient({
//       url: process.env.REDIS_URL || 'redis://localhost:6379'
//     });

//     this.client.on('error', (err) => console.error('Redis Client Error', err));
//     this.client.connect();
//   }

//   async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
//     const serializedValue = Buffer.from(value).toString('base64');
//     if (ttlSeconds) {
//       await this.client.set(key, serializedValue, { EX: ttlSeconds });
//     } else {
//       await this.client.set(key, serializedValue);
//     }
//   }

//   async get(key: string): Promise<Buffer | null> {
//     const value = await this.client.get(key);
//     if (!value) return null;
//     return Buffer.from(value, 'base64');
//   }

//   async del(key: string): Promise<void> {
//     await this.client.del(key);
//   }
// } 