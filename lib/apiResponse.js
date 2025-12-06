const { client } = require("../config/database");
const { verifyUser } = require("../middleware/verify_user");

// console.log(verifyIdToken());

/**
 * @param {import('express').Express} app
 */
async function run(app) {
    const db = client.db('myDatabase');
   const usersCollection = db.collection('usersCollection');
   const mealsCollection = db.collection('mealsCollection');
   const reviewsCollection = db.collection('reviewsCollection');
   
    try{
        app.get('/',verifyUser,(req,res)=> {
            res.send({message:"Server running"})
            console.log('Run Fn succesfully imported');
        })
        // user related apis
        app.post('/users', async(req,res) => {
            const user = await req.body;
            if(user){
        const existingUser = await usersCollection.findOne({ email: user.email });

                    if (existingUser) {
                        console.log("User Already Exists");
                        return res.send({ message: "User Already Exists" });
                    }
                const userData = {
                    name: user.displayName || "Anonymous",
                    profile_image: user.photoURL || null,
                    email: user.email,
                    age: user.age || null,
                    status: "Active",
                    role: "User",
                    created_at: new Date()
                }
                const result = await usersCollection.insertOne(userData);
                res.send({message:"User Post Request Received"})
            }
        })

        // meals related apis
        app.get('/meals', async(req,res) => {
            const result = await mealsCollection.find().toArray();
            console.log(result);
            res.send(result)
        })
        // reviewa related apis
        app.get('/reviews', async(req,res) => {
            const result = await reviewsCollection.find().toArray();
            // console.log(result);
            res.send(result)
        })
    }
    catch{
        console.log("Something went wrong")
    }
}

module.exports = {run};