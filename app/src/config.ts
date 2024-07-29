export const config = {
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
    },
    database: {
      filename: process.env.DB || "my.db",
    },
    server: {
      port: parseInt(process.env.PORT || "5000", 10),
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 1000,
    },
    url:"https://raw.githubusercontent.com/tzutalin/ImageNet_Utils/master/detection_eval_tools/structure_released.xml"
  };