import 'dotenv/config';
import axios from 'axios';
import prismaClient from '../prisma';
import { sign } from 'jsonwebtoken';

/**
 * Receber code(string)
 * Recuperar o access_token no github
 * Recuperar infos do user do github
 * Verificar se o usuário existe no DB
 * -- sim: Gerar token
 * -- não: criar no DB, gerar token
 * Retornar token com infos do user
 */

interface IAccessTokenResponse {
  access_token: string;
}

interface IUserResponse {
  avatar_url: string;
  login: string;
  id: number;
  name: string;
}

class AuthenticateUserService {
  async execute(code: string) {
    // Receber code
    const url = 'https://github.com/login/oauth/access_token';

    // Recuperar o access_token no github
    const { data: accessTokenResponse } =
      await axios.post<IAccessTokenResponse>(url, null, {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      });

    // Recuperar infos do user do github
    const response = await axios.get<IUserResponse>(
      'https://api.github.com/user',
      {
        headers: {
          authorization: `Bearer ${accessTokenResponse.access_token}`,
        },
      }
    );

    const { login, id, avatar_url, name } = response.data;

    let user = await prismaClient.user.findFirst({
      where: {
        github_id: id,
      },
    });

    // Verificar se o usuário existe no DB
    if (!user) {
      // se não existe cria
      user = await prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name,
        },
      });
    }

    // gerar token
    const token = sign(
      {
        name: user.name,
        avatar_url: user.avatar_url,
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: '1d',
      }
    );

    return { token, user };
  }
}

export { AuthenticateUserService };
