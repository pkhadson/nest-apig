/* eslint-disable prettier/prettier */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (options, webpack) => {
  const lazyImports = [
    "@nestjs/microservices",
    "@nestjs/microservices/microservices-module",
    "@nestjs/websockets/socket-module",
    // 'class-validator',
    // 'class-transformer',
    // 'class-transformer/storage',
  ];

  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        ...options.resolve.alias,
        "class-transformer/storage": require.resolve(
          "class-transformer/cjs/storage"
        ),
      },
    },
    externals: [
      "@aws-sdk/client-sns",
      "@nestjs/microservices",
      "@nestjs/websockets/socket-module",
    ],
    output: {
      ...options.output,
      libraryTarget: "commonjs2",
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (resource.includes("aws-cdk-lib")) {
            return false;
          }
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],

    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
          },
        }),
      ],
    },
  };
};
