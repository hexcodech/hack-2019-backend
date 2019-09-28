const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    locale: String!
    meetups: [Meetup!]!
    updatedAt: Int
    createdAt: Int
  }
  type Meetup {
    id: ID!
    title: String!
    token: String!
    description: String
    maxTravelTime: Int
    ownerId: ID
    owner: User!
    users: [User!]!
    events: [Event!]!
    updatedAt: String
    createdAt: String
    canEdit: Boolean
    canDelete: Boolean
  }
  type Event {
    title: String!
    description: String
    categoryIds: [ID!]!
    travelTime: Int!
    startDateTime: Int!
    endDateTime: Int!
    price: Int
    rating: Int
    priceLevel: Int
  }
  type Query {
    meetup(id: ID!): Meetup
    user(id: ID!): User
    me: User!
  }
  type Mutation {
    createMeetup(
      title: String
      description: String
      categoryIds: [ID!]!
      travelTime: Int!
      meansOfTransport: String!
      datetime: Int!
      username: String!
      location: String!
    ): Meetup!
    updateMeetup(id: Int!, title: String!, description: String): Meetup!
    deleteMeetup(id: Int!): Int!
  }
`;
