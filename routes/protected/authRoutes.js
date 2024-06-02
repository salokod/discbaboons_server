// routes/authRoutes.js
import router from "../../router.js";
import { findOneUserName } from "../../controllers/userDatabaseDynamo.js";

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //read the username and password from the request

  const user = await findOneUserName(username);
  res.json({ message: "Hi", userData: user }).status(200);
});

router.all("/login", (req, res) => {
  res.status(405).json({ message: "Method Not Allowed" });
});

// More user routes...

export default router;
