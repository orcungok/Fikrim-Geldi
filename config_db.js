const config = {
  db_login: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_LOGIN,
    port: process.env.DATABASE_PORT,
  },

  db_projeler: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_PROJELER,
    port: process.env.DATABASE_PORT,
  },

  db_takim_arkadasi_ilanlari: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_TAKIM_ARKADASI_ILANLARI,
    port: process.env.DATABASE_PORT,
  },
};

module.exports = config;
