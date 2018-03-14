const configs = require('../config')

module.exports = require('knex')({
  client: 'mysql',
  connection: {
    host: configs.coredb.host,
    port: configs.coredb.port,
    user: configs.coredb.user,
    password: configs.coredb.pass,
    database: configs.coredb.db,
    charset: configs.coredb.char
  }
})
