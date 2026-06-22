import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    databaseDriverOptions: process.env.NODE_ENV === 'production'
      ? { ssl: { rejectUnauthorized: false } }
      : undefined,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      }
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      }
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          redisUrl: process.env.REDIS_URL,
        }
      }
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
              waitLockingTimeout: 10,
            }
          }
        ]
      }
    },
    // File storage — activates only when Supabase S3 credentials are present
    ...(process.env.S3_ACCESS_KEY_ID ? [{
      resolve: "@medusajs/file-s3",
      options: {
        s3_url: `https://${process.env.S3_ENDPOINT_HOST}/storage/v1/s3`,
        bucket: process.env.S3_BUCKET || "asuma-products",
        region: process.env.S3_REGION || "eu-central-1",
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
        // Supabase Storage public URL prefix for serving files
        file_url: `https://${process.env.S3_ENDPOINT_HOST}/storage/v1/object/public/${process.env.S3_BUCKET || "asuma-products"}`,
      }
    }] as any : [])
  ]
})
