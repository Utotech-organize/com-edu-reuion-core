module.exports = {
  apps: [
    {
      name: "com-edu-reunion-core",
      script: "yarn",
      automation: false,
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
