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

interface IAccessTokenResponse {
   access_token: string;
}

class AuthenticateUserService {
   async execute(code: string) {
      const url = "https://github.com/login/oauth/access_token";

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

      const response = await axios.get("https://api.github.com/user", {
         headers: {
            authorization: `Bearer ${accessTokenResponse.access_token}`
         }
      });

      return response.data;
   }
}

export { AuthenticateUserService };