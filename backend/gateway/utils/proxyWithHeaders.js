import proxy from "express-http-proxy";

export const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const lowerOrigin = origin.toLowerCase().trim();
  const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.toLowerCase().trim() : null;
  
  return lowerOrigin.includes("localhost") || 
         lowerOrigin.includes("127.0.0.1") || 
         lowerOrigin.endsWith(".vercel.app") || 
         (clientUrl && (lowerOrigin === clientUrl || lowerOrigin === clientUrl + "/"));
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