const DB = require('./models')

DB.Users.hasMany(DB.Posts,{foreignKey:'email'})


DB.sequelize
.authenticate()
.then(()=>{
    console.log("Connection Success")
})
.catch(err=>{
    console.error('Unable to connect to the database:',err)
})

DB.sequelize.sync({
    logging:console.log,
    force:true
}).then(()=>{
    console.log("Table Created Successfully")
}).catch(err=>{
    console.error(err)
})


//DB.sequelize.sync().then(() => console.log("Table Created"))