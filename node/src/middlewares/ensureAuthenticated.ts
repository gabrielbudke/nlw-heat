import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload {
   sub: string;
}

export function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
   const authToken = request.headers.authorization;

   if (!authToken) {
      return response.status(401).json({
         errorCode: "token.invalid!"
      });
   }

   // Quando o token vem pelo header, ele vem da seguinte forma: 
   // --> Bearer afdsuh446jfgyjftfua689887
   // Dessa forma, podemos desestruturar ele da seguinte maneira:
   // [0] -> Bearer
   // [1] -> afdsuh446jfgyjftfua689887
   const [, token] = authToken.split(" ");

   try {
      const { sub } = verify(token, process.env.JWT_SECRET_KEY) as IPayload;

      request.user_id = sub;

      return next();

   } catch (err) {
      return response.status(401).json({
         errorCode: "token.expired"
      });
   }

}