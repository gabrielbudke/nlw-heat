/**
 * 1. Receber code(string)
 * 2. Recuperar o access_token no github
 * 3. Recuperar infos do usuário do github
 * 4. Verificar se o usuário existe no banco de dados
 *    --> SIM: Gera um token pra ele
 *    --> Não: Insere no banco de dados e gera um token
 * 5. Retorna o token e as infos do usuário
 */
import axios from "axios";
import { sign } from "jsonwebtoken";
import prismaClient from "../prisma";

interface IAccessTokenResponse {
   access_token: string;
}

interface IUserResponse {
   avatar_url: string,
   login: string,
   id: number,
   name: string,
}

class AuthenticateUserService {
   async execute(code: string) {
      const url = "https://github.com/login/oauth/access_token";

      // Faz uma chamada para o github para buscar o access_token que irá autenticar o usuário
      const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, {
         params: {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
         },
         headers: {
            "Accept": "application/json"
         }
      });

      // Realiza a chamada para a api do github para buscar as informações do usuário
      const response = await axios.get<IUserResponse>("https://api.github.com/user", {
         headers: {
            authorization: `Bearer ${accessTokenResponse.access_token}`
         }
      });

      const { login, id, avatar_url, name } = response.data;

      // Realiza uma consulta no banco de dados para encontrar usuário 
      let user = await prismaClient.user.findFirst({
         where: {
            github_id: id
         }
      });

      // Caso não exista um usuário, realiza a criação
      if (!user) {
         user = await prismaClient.user.create({
            data: {
               name,
               login,
               avatar_url,
               github_id: id,
            }
         });
      }

      // Gera um token para o usuário logado
      const token = sign({
         user: {
            name: user.name,
            avatar_url: user.avatar_url,
            id: user.id
         }
      }, process.env.JWT_SECRET_KEY, {
         subject: user.id,
         expiresIn: "1d"
      });

      return { token, user };

   }
}

export { AuthenticateUserService };