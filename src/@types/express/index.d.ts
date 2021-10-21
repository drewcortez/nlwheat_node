// isto sobreescreve o @types/express adicionando a var user_id ao request.
// assim podemos usar o middleware ensureAuthenticated que criamos. Este middleware
// adiciona a var user_id ao request, e por não ser uma var padrão do request no
// express, o typescript vai ficar dando erro nisso

declare namespace Express {
  export interface Request {
    user_id: string;
  }
}
