require("dotenv").config();
const env = process.env;

const development = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  host: env.MYSQL_AWS_HOST,
  dialect: "mysql",
};

const production = {
  username: env.MYSQL_USERNAME,
  password: null,
  database: env.MYSQL_DATABASE_PRODUCTION,
  host: env.MYSQL_HOST,
  dialect: "mysql",
};

const test = {
  username: env.MYSQL_USERNAME,
  password: null,
  database: env.MYSQL_DATABASE_TEST,
  host: env.MYSQL_HOST,
  dialect: "mysql",
};

module.exports = { development, production, test };
