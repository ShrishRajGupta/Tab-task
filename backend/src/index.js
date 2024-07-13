import "dotenv/config";
import connectDB from "./db/conn.js";
import {app} from "./app.js";
const PORT = process.env.PORT || 8000;

connectDB()
.then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is now running on http://localhost:${PORT}`);
      })
})
.catch((err)=>{
    console.log("MongoDB error connection",err);
});
