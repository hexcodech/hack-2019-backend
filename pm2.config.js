module.exports = {
  apps: [
    {
      name: "words-server",
      script: "./src/index.js",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
