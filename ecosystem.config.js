module.exports = {
  apps : [{
    name: "app",
    script: "./karma.conf.js",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}