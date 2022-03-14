# Api Store

## Description

Generic Api Store

## Steps to run

1. Clone this repository
2. Define the configuration variables in an .env file as shown in .env.example
3. Install the dependencies with `npm install`
4. Do migrations with `npm run prisma:migrate:run`
5. Run the command if the models wasn't generated: `npm run prisma:generate`
6. Run the aplication with `npm run start:dev`
7. To see swagger documentation use this link http://localhost:3000/api
8. create a user with signup or use these users to login

Manager

```
{
  "email":"manager@gmail.com",
  "password":"holamundo"
}|
```

Client

```
{
  "email":"client@gmail.com",
  "password":"holamundo"
}|
```

9. To create a product you can use these categories' id

```
"3e78af91-136d-467c-b31a-eace11bf7219" ->	"candy"
"3e78af91-136d-467c-b31a-eace11bf7220" -> "chocolate"
"3e78af91-136d-467c-b31a-eace11bf7221" ->	"snack"
```

## Steps to test

1. Create a .env.test file and define the configuration variables as shown in .env.example
2. Do the migrations with: `npm run prisma:migrate:test:run`
3. Run each test with: `npm run test`
4. Run the test coverange with `npm run test:cov`
