const Sequelize = require('sequelize')
const sequelize=new Sequelize('todo','root','root',{
    dialect:'mysql',
    storage: './db.sqlite3'
})

module.exports = sequelize