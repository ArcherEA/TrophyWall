import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function main() {
  await redis.set('test:ping', 'hello from redis', 'EX', 60); // expires in 60s
  const value = await redis.get('test:ping');
  console.log('Value from Redis:', value);

  await redis.del('test:ping');
  const afterDelete = await redis.get('test:ping');
  console.log('After delete:', afterDelete); // should print null
}

main()
  .catch(console.error)
  .finally(() => redis.quit());
