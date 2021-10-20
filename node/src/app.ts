import "dotenv/config";
import express from "express";
import { routes } from "./routes";

const app = express();
app.use(express.json());
app.use(routes);


app.get("/github", (request, response) => {
   return response.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`);
});

app.get("/signin/callback", (request, response) => {
   const { code } = request.query;
   return response.json({ code });
});

app.listen(3333, () => console.log("[server] Server is running on port 3333"));