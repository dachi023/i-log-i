export type AppEnv = {
  Bindings: {
    COMMON_DB: D1Database;
    USER_DB: D1Database;
    MEDIA_BUCKET: R2Bucket;
    SESSION_KV: KVNamespace;
    JWT_SECRET: string;
    ENVIRONMENT: string;
  };
  Variables: {
    userId: string;
    userRole: string;
    userDbName: string | null;
  };
};
