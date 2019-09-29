const { gql } = require("apollo-server-express");

module.exports = gql`
  type MeetupRelation {
    longitude: Float!
    latitude: Float!
    meansOfTransport: String!
  }
  type User {
    id: ID!
    name: String!
    email: String!
    locale: String!
    meetups: [Meetup!]!
    updatedAt: Int
    createdAt: Int
    meetupRelation(meetupId: ID!): MeetupRelation
  }
  type Meetup {
    id: ID!
    title: String
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
    latitude: Float!
    longitude: Float!
    placeId: String!
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
    joinMeetup(
      meansOfTransport: String!
      username: String!
      location: String!
      meetupId: ID!
    ): Meetup!
    updateMeetup(id: Int!, title: String!, description: String): Meetup!
    deleteMeetup(id: Int!): Int!
  }
`;
