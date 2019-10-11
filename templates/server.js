const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");
const DB = require('../models')
const nodemailer = require('nodemailer')

app.set('views', __dirname + '/views');
app.set("view engine", "hbs");

app.use(
  session({
    secret: "nobody should guess this",
    saveUninitialized: true,
    cookie: {
      secure: false
    }
  })
);

app.use(bodyParser.urlencoded({
  extended: true
}));

const loggedInOnly = (failure = "/login") => (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect(failure);
  }
};

app.get("/", loggedInOnly(), (req, res) => {
  res.redirect("/getBands")
})

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  const {
    email,
    password
  } = req.body;
  DB.Users.findOne({
      where: {
        email: email,
        password: password
      }
    })
    .then((userList) => {
      req.session.user = {
        email: userList.email,
      };

      res.redirect("/");
    })
    .catch((err) => {
      console.log(err)
      res.sendStatus(401)
    })
})

app.post('/signup', (req, res) => {
  const message = "WELCOME TO YOUR BAND"
  res.render("signup", {
    message
  })
})

app.post('/register', (req, res) => {

  const {
    name,
    company,
    dob,
    email,
    password
  } = req.body;
  DB.Users.create({
    name: name,
    collcomp: company,
    dob: dob,
    email: email,
    password: password
  }).then(newUser => {
    console.log(newUser)
    res.redirect('/login')
  }).catch((err) => res.write(err))
})

app.get('/userdetails', (req, res) => {
  console.log('callling uinfo')
  const user = req.session.user.email
  DB.Users.findAll({
      where: {
        email: user
      }
    }).then((users) => {
      const uinfo = users.map(p => p.get({
        plain: true
      }))
      req.session.user.uinfo = uinfo
      res.render("userdetails", {
        uinfo: req.session.user.uinfo[0]
      })
    })
    .catch((error) => {
      console.log(error)
    })
})


app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')

})

app.post("/add", (req, res) => {
  const name = req.body.bandname
  const info = req.body.bandinfo
  const user = req.session.user.email
  DB.Posts.create({
    title: name,
    description: info,
    email: user
  }).then(newUser => {

    res.redirect('/getBands')
  }).catch((err) => console.log(err))

})

app.get('/getBands', (req, res) => {
  console.log('callling')
  const user = req.session.user.email


  DB.Posts.findAll({
      where: {
        email: user
      }
    }).then((posts) => {
      const bands = posts.map(p => p.get({
        plain: true
      }))
      req.session.user.bands = bands

      res.render("index", {
        name: req.session.user.email,
        bands: req.session.user.bands
      })
    })

    .catch((error) => {
      console.log(error)
    })
})


app.get('/delete/:id', (req, res) => {
  const id = req.params.id
  const user = req.session.user.email
  DB.Posts.destroy({
    where: {
      id: id,
      email: user
    }
  }).then(deletedPost => {

    res.redirect('/getBands')
  }).catch(err => console.err(err))
})



app.get('/edit/:id', (req, res) => {
  const id = req.params.id
  const user = req.session.user.email
  DB.Posts.findOne({
      where: {
        id: id,
        email: user
      }
    }).then((posts) => {
      const band = posts.get({
        plain: true
      })
      res.render('edit', {
        band
      })
      console.log(posts.get({
        plain: true
      }).title)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.post('/modify/:id', (req, res) => {
  console.log("called")
  const id = req.params.id

  DB.Posts.update({
    title: req.body.bandname,
    description: req.body.bandinfo
  }, {
    returning: true,
    where: {
      id: id
    },
    plain: true
  }).then((result) => {
    res.redirect('/getBands')

  }).
  catch((err) => console.log(err))
})
app.get('/forgetpassword', (req, res) => {
  res.render("forgetpass")
})

app.post('/forget', (req, res) => {
  const uemail = req.body.email
  req.session.email = uemail

  const otp = Math.floor(1000 + Math.random() * 9000);
  req.session.otp = {
    otp: otp
  }

  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'admin@gmail.com',
      pass: 'adminpassword'
    }
  });

  var mailOptions = {
    from: 'admin@gmail.com',
    to: uemail,
    subject: 'Password Reset OTP',
    text: `OTP for password reset is ${otp}.`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.render('otp', {
    otp
  })
})
app.post('/verifyotp', (req, res) => {
  console.log("calling")
  const genotp = req.session.otp.otp;
  const otp = parseInt(req.body.otp);

  if (genotp === otp) {
    res.render('resetpass')
  } else {
    res.send("INVALID OTP")
  }
})

app.post('/verifypwd', (req, res) => {

  const email = req.session.email
  const newpass = req.body.newpass

  DB.Users.update({
    password: newpass
  }, {
    returning: true,
    where: {
      email: email
    },
    plain: true
  }).then((result) => {
    res.redirect('/login')
  }).
  catch((err) => console.log(err))
})
app.listen(8080);