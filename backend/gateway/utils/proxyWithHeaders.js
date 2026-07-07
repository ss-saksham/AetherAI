import proxy from "express-http-proxy";

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

export const isOriginAllowed = (origin) => {
  if (!origin) return false;
  return allowedOrigins.includes(origin) || 
         origin.endsWith(".vercel.app") || 
         origin.includes("localhost");
};

export const customProxy = (serviceUrl, options = {}) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Pass user headers if present
      if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        proxyReqOpts.headers["x-user-email"] = srcReq.user.email;
        proxyReqOpts.headers["x-user-avatar"] = srcReq.user.avatar;
      }
      
      // Call custom decorator if provided
      if (options.proxyReqOptDecorator) {
        return options.proxyReqOptDecorator(proxyReqOpts, srcReq);
      }
      return proxyReqOpts;
    },
    
    userResHeaderDecorator: (headers, userReq, userRes, proxyReq, proxyRes) => {
      const origin = userReq.headers.origin;
      if (isOriginAllowed(origin)) {
        headers["access-control-allow-origin"] = origin;
        headers["access-control-allow-credentials"] = "true";
      }
      
      // Call custom decorator if provided
      if (options.userResHeaderDecorator) {
        return options.userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes);
      }
      return headers;
    }
  });
};