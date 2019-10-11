const Sequelize = require('sequelize')
const sequelize = require('./sequelize')

const Users=sequelize.define('Users',{
    name:Sequelize.STRING,
    collcomp:Sequelize.STRING,
    dob:Sequelize.DATEONLY,
    email:{
        type:Sequelize.STRING,
        primaryKey:true
    },
    password:Sequelize.STRING
})


const Posts=sequelize.define('Post',{
    title:Sequelize.STRING,
    description:Sequelize.STRING,
    email:Sequelize.STRING
})

module.exports={
    Users,
    Posts,
    sequelize
}