const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.PAYMENT);
//middlewere
app.use(cors());
app.use(express.json());
//jwt verifu
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxmnpk6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db("martialDb").collection("users");
    const classesCollection = client.db("martialDb").collection("classes");
    const feedbackCollection = client.db("martialDb").collection("feedback");
    const paymentCollection = client.db("martialDb").collection("payment");
    const studentClassCollection = client
      .db("martialDb")
      .collection("studentclass");
    const instructorsCollection = client
      .db("martialDb")
      .collection("instructors");
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
    //verifyAdmin
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden message" });
      }
      next();
    };
    //feedback --------------------------------------------
    //fedback-----------------

    app.get("/feedback", async (req, res) => {
      // const id = req.params.id;
      // const query = { id: id };
      // console.log(query);
      const result = await feedbackCollection.find().toArray();
      res.send(result);
    });
    app.post("/feedback", async (req, res) => {
      const user = req.body;

      const result = await feedbackCollection.insertOne(user);
      res.send(result);
    });
    //feeddback end------------------------
    //feeddback end------------------------
    //feeddback end------------------------
    //users relades api-------------------------------
    //users relades api
    //users relades api
    app.get("/users", async (req, res) => {
      const query = { role: req.query.role };
      const result = await usersCollection
        .find(query)
        .sort({ endrol: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    app.get("/allusers", async (req, res) => {
      const query = { role: req.query.role };
      const result = await usersCollection
        .find(query)

        .toArray();
      res.send(result);
    });
    app.get("/useramin", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const query = { email: user?.email };
      // console.log(query);
      const alreadyUser = await usersCollection.findOne(query);
      if (alreadyUser) {
        return res.send({ message: "user already exists" });
      }

      // const alreadyRole = await usersCollection.findOne({ role: user?.role });
      // if (alreadyRole) {
      //   return res.send({ message: "user role already exists" });
      // }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      // console.log(req.decoded.email);
      if (req.decoded.email !== email) {
        res.send({ admin: false });
      }
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      // const result = { admin: user?.role === "admin" };
      res.send(result);
    });
    app.patch("/users/admin/:id", async (req, res) => {
      // console.log(req.query.role);
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const doc = {
        $set: {
          role: req.query.role,
        },
      };
      const result = await usersCollection.updateOne(filter, doc);
      res.send(result);
    });
    app.patch("/users", async (req, res) => {
      // console.log(req.query.role);
      const query = { email: req.query.email };
      const { endrol } = await usersCollection.findOne(query);
      console.log(endrol);
      if (endrol) {
        const doc = {
          $set: {
            endrol: endrol + 1,
          },
        };
        const result = await usersCollection.updateOne(query, doc);
        res.send(result);
      } else {
        const doc = {
          $set: {
            endrol: 1,
          },
        };
        const result = await usersCollection.updateOne(query, doc);
        res.send(result);
      }
    });

    //user end--------------------------
    //user end--------------------------
    //user end--------------------------
    //user end--------------------------
    //instructo
    app.post("/addclass", async (req, res) => {
      const newClass = req.body;
      const result = await classesCollection.insertOne(newClass);
      res.send(result);
    });
    app.get("/addclass", async (req, res) => {
      const query = { Instructor_Email: req.query.email };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/addclasses", async (req, res) => {
      const result = await classesCollection
        .find({ Status: "approve" })
        .sort({ endrol: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    app.get("/allclasses", async (req, res) => {
      const result = await classesCollection
        .find({ Status: "approve" })
        .toArray();
      res.send(result);
    });
    app.get("/alladdclasses", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    app.patch("/addclass/:id", async (req, res) => {
      const id = req.params.id;
      console.log(req.params.id);
      const filter = { _id: new ObjectId(id) };
      // if (req.query.status) {
      const doc = {
        $set: {
          Status: req.query.status,
        },
      };
      const result = await classesCollection.updateOne(filter, doc);
      res.send(result);
      // }
      // if (req.query.available) {
      //   const doc = {
      //     $set: {
      //       Available_Seats: req.body.available,
      //     },
      //   };
      //   const result = await classesCollection.updateOne(filter, doc);
      //   res.send(result);
      // }
    });
    app.patch("/addclass/availableseat/:id", async (req, res) => {
      const id = req.params.id;
      console.log(req.body);

      const filter = { _id: new ObjectId(id) };
      // if (req.query.status) {
      const doc = {
        $set: {
          Available_Seats: req.body.seat - 1,
          endrol: req.body.totalSeat - req.body.seat + 1,
        },
      };
      const result = await classesCollection.updateOne(filter, doc);
      res.send(result);
    });
    app.put("/addclass/:id", async (req, res) => {
      const id = req.params.id;
      const {
        Status,
        Price,
        Available_Seats,
        Instructor_Email,
        Instructor_Name,
        Class_Image,
        Class_Name,
      } = req.body;

      const filter = { _id: new ObjectId(id) };
      const doc = {
        $set: {
          Status,
          Price,
          Available_Seats,
          Instructor_Email,
          Instructor_Name,
          Class_Image,
          Class_Name,
        },
      };
      const result = await classesCollection.updateOne(filter, doc);
      res.send(result);
    });
    //class-------------------
    //class-------------------
    //class-------------------
    //class-------------------
    //class-------------------
    //student
    app.post("/selectedclass", async (req, res) => {
      const addClass = req.body;
      const result = await studentClassCollection.insertOne(addClass);
      res.send(result);
    });
    app.patch("/selectedclass/:id", async (req, res) => {
      const id = req.params.id;
      const newa = req.body;
      console.log(newa);
      const filter = { _id: new ObjectId(id) };
      // console.log(req.body);
      const doc = {
        $set: {
          ...req.body,
        },
      };
      const result = await studentClassCollection.updateOne(filter, doc);
      res.send(result);
    });
    app.get("/payments", verifyJWT, async (req, res) => {
      const result = await paymentCollection
        .find()
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });
    app.post("/payments", verifyJWT, async (req, res) => {
      const payment = req.body;
      const insertResult = await paymentCollection.insertOne(payment);
      const query = { _id: new ObjectId(payment._id) };
      const deleteResult = await studentClassCollection.deleteOne(query);
      console.log(query);
      res.send({ insertResult, deleteResult });
    });
    app.delete("/selectedclass/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await studentClassCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/selectedclass", verifyJWT, async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }

      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res
          .status(403)
          .send({ error: true, message: "forbidden access" });
      }
      const query = { email: email };
      const result = await studentClassCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/endrolclasses", verifyJWT, async (req, res) => {
      const query = { cheack: 2023 };
      const result = await studentClassCollection
        .find(query)
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });

    //payment
    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
      const { price } = req.body;
      if (price) {
        const amount = parseFloat(price) * 100;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });
        res.send({ clienSecret: paymentIntent.client_secret });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("connection sucsess");
});
app.listen(port, () => {
  console.log("server is connert port " + port);
});
