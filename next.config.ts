import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // experimental: {
  //   serverComponentsExternalPackages: ["libsql"],
  // },
  // // Or if you want to remove it from externalization completely:
  // webpack: (config, { isServer }) => {
  //   if (isServer) {
  //     config.externals = config.externals || [];
  //     config.externals.push({
  //       libsql: "commonjs libsql",
  //     });
  //   }
  //   return config;
  // },
};

export default nextConfig;
