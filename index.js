const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 9000;

//middleware
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.muhos.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);

async function run() {
  try {
    await client.connect();
    console.log("Database connected successfully");
    const database = client.db("sunStore");
    const servicesCollection = database.collection("services");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const reviewCollection = database.collection("review");

    // GET API
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // GET Single Service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific service", id);
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });

    //post API
    app.post("/services", async (req, res) => {
      const service = req.body;
      // console.log("hit the post api", service);
      const result = await servicesCollection.insertOne(service);
      // console.log(result);
      res.json(result);
    });
    //Delete Post
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });
    // insert order and
    app.post("/addOrders", async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.send(result);
    });

    //  my order
    app.get("/myOrder/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await ordersCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });
    //delete order
    app.delete("/myOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });

    // review
    app.post("/addReview", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    });

    /// all order
    app.get("/allOrders", async (req, res) => {
      // console.log("hello");
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });

    // status update
    app.put("/statusUpdate/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      console.log(req.params.id);
      const result = await ordersCollection.updateOne(filter, {
        $set: {
          status: req.body.status,
        },
      });
      res.send(result);
      console.log(result);
    });
    // check admin or not
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await usersCollection
        .find({ email: req.params.email })
        .toArray();
      console.log(result);
      res.send(result);
    });
    //  make admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("SunStore server is running");
});

app.listen(port, () => {
  console.log("Server Running at port", port);
});