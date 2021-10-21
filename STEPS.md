CREATE AND PREPARE BASE PROJECT:

001. create folder
002. run: npm init -y
003. run: npm install express
004. run: npm install -d @types/express typescript ts-node-dev
     - geralmente as tipagens são instaladas separadamentes pois devem estar disponíveis somente em 
       ambiente de desenvolvimento

005. create folder: src
006. create: src/app.ts
007. run: tsc --init
008. in tsconfig.json, set "strict" to false and "target" to "es2017"
009. in package.json, scripts, add line "dev": "ts-node-dev --exit-child src/app.ts"
010. write app.ts:
        import express from 'express';
        const app = express();
        app.listen(4000, () => console.log('Server is running on port 4000'));

011. test: npm run dev
012. install prisma: npm install prisma --save-dev
013. run: npx prisma init
     - this creates ".env" file w/ DATABASE_URL and "prisma" folder w/ "schema.prisma". 

014. Delete all from .env file
015. Set "datasource db" in prisma/schema.prisma to: 
        {
            provider = "sqlite"
            url      = "file:./dev.db"
        }

FIRST PART: AUTHENTICATE USER TO GITHUB
- GET AUTHENTICATION CODE
- GET GITHUB ACCESS_TOKEN
- GET GITHUB USER INFOS

016. configure OAuth on Github:
     go to https://github.com/settings/developers
     click "Register a new application"
        Application name: NLW Heat Node
        Homepage URL: http://localhost:4000
        Application description: NLW Heat Node
        Authorization callback URL: http://localhost:4000/signin/callback
     click "Register"
     click "Generate a new client secret"
     copy the client secret and id into .env

017. run: npm install dotenv
     this lets you use .env (automatic in frameworks like next.js)

018. import dotenv to app.ts
     import "dotenv/config";

019. create route for signin in app.ts
     app.get('/github', (request, response) => {
        response.redirect(
            `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
        );
     });

020. create callback route
     app.get("/signin/callback", (request, response) => {
        const { code } = request.query;
     })

021. run: npm install axios
022. run: npm install @types/axios -d
023. create folder src/services
024. create file src/services/AuthenticateUserService.ts
025. create folder src/controllers
026. create file src/controllers/AuthenticateUserController.ts
027. create file src/routes.ts
     and write it

028. import the routes into app.ts
        import { router } from './routes';
        ...
        app.use(router);

029. try it in postman
     in browser go to http://localhost:4000/github
     log
     copy the code returned
     in postman run a POST to {{baseURL}}/authenticate w/ body { "code": "pastecodehere" }

030. run: npm install jsonwebtoken
031. run: npm install @types/jsonwebtoken -d
032. in AuthenticateUserService.ts, create interface IAccessTokenResponse and IUserResponse and use them

SECOND PART: AUTHENTICATE USER TO GITHUB
- VERIFY USER IN LOCAL DB
- EXISTENT: GENERATE AUTH TOKEN
- NONEXISTENT: GENERATE NEW USER AND AUTH TOKEN

033. install extensions prisma and prisma-insider into VSCode
034. open VSC settings.json w/ Ctrl + Shift + P and add the setting:
        "[prisma]": {
            "editor.defaultFormatter": "Prisma.prisma"
        }

035. in schema.prisma, declare the "users" schema:
        model User {
        id         String @id @default(uuid())
        name       String
        hitgub_id  Int
        avatar_url String
        login      String

        @@map("users")
        }

036. run: npx prisma migrate dev
     name the migration "create-user"

037. create prisma client for db connections:
     create folder src/prisma and file src/prisma/index.ts
038. import prismaClient to src/services/AuthenticateUserService.ts
039. create md5 code for jwt secret, add to .env and use it to create token in AuthenticateUserService.ts

TIRD PART: MESSAGES

040. create file src/services/CreateMessageService.ts
041. declare messages schema im schema.prisma
        model Message {
        id         String   @id @default(uuid())
        text       String
        created_at DateTime @default(now())
        user       User     @relation(fields: [user_id], references: [id])

        @@map("messages")
        user_id String
        }
     tip: just type user User and save, the relationship will be created automatically
042. run: npx prisma migrate dev
     name as create-messages
043. create file src/controllers/CreateMessageController.ts
044. create folder src/middleware
045. create file src/middleware/ensureAuthenticated
046. create folder and files src/@types/express/index.d.ts
047. in tsconfig.json add
    "typeRoots": ["./src/@types", "node_modules/@types"]
048. run 'npx prisma studio' to start a ORM studio in your browser

FOURTH PART: WEBSOCKETS

049. run: npm install socket.io
050. run: npm install @types/socket.io -d
051. rewrite app.ts, changing the server creation to http instead of express
052. run: npm install cors
053. run: npm install @types/cors -d
054. import and use conrs in app.ts to allow cors origin to '*'
055. for testing, create folder and file public/index.html and open it in the browser
056. create file server.ts and change server from app.ts to server.ts
057. in package.json change script to "dev": "ts-node-dev --exit-child src/server.ts"
058. launch the server, open in browser public/index.html and send new message w/ postman for test
059. create file src/services/GetLast3MessagesService.ts
059. create file src/controllers/GetLast3MessagesController.ts
060. include GetLast3MessagesController to routes.ts
062. create file src/services/ProfileUserService.ts
063. create file src/controllers/ProfileUserController.ts
064. include ProfileUserController to routes.ts