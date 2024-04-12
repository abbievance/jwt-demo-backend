import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express';
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { auth, generateToken } from './auth';

const prisma = new PrismaClient()

const app = express()
const port = 3000

app.use( express.json() )
app.use( express.urlencoded( {extended: true} ))


// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});


app.get('/', async (req: Request, res: Response) => {
    res.send("Welcome to the home page")
})

app.post("/register", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword
        },
      })
      res.json(user)
    }
)

  
  // login endpoint
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (email === null || password === null) {
      res.status(400).json({ message: 'Request missing email or password' });
    }
  
    const user = await prisma.user.findFirst({
        where: {
            email: email
        }
    });

    if(user){
        bcrypt
        .compare(req.body.password, user?.password)
    
        // if the passwords match
        .then((passwordCheck: Boolean) => {
    
          // check if password matches
          if(!passwordCheck) {
            return res.status(400).send({
              message: "Passwords do not match"
            });
          } else{
            const token = generateToken(user.email)
            res.send({message: "Login Successful",
                token
            })
          }
      })
    }else{
        res.send("Could not find user")
    }
    })
  
  // free endpoint
  app.get("/free-endpoint", (request, response) => {
    response.json({ message: "You are free to access me anytime" });
  });
  
//   authentication endpoint
  app.get("/auth-endpoint", auth, (request, response) => {
    response.send({ message: "You are authorized to access me" });
  });

  app.get('/users', auth, async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.json({users});
})
  
  module.exports = app;


app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})


