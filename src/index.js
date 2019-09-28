const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const resolvers = require("./resolvers");
const typeDefs = require("./schema");
const db = require("../models");
const passport = require("./authentication")(db);
const { InsufficientArgumentsError } = require("./errors");

const GRAPHQL_PATH = "/graphql";

//setup database
db.sequelize.sync().then(() => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req: request }) => ({ db, user: request.user }),
    playground: true,
    introspection: true
  });

  const app = express();
  const jsonParser = express.json();

  //app.use(GRAPHQL_PATH, passport.authenticate("bearer", { session: false }));

  app.post("/login", jsonParser, (request, response) => {
    const { name, email, locale } = request.body;

    if (!name || !email || !locale) {
      throw new InsufficientArgumentsError();
    }

    return db.user
      .login(name, email, locale)
      .then(() => response.end(JSON.stringify({ success: true })));
  });

  server.applyMiddleware({ app, path: GRAPHQL_PATH });

  app.listen({ port: 8004 }, () =>
    console.log(`🚀 Server ready at http://localhost:8004${server.graphqlPath}`)
  );
});
