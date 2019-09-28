const { Op } = require("sequelize");
const fetch = require("node-fetch");

const { NotFoundError, MissingPermissionError } = require("./errors");
const { queryEvents } = require("./api");
const {
  TRAVEL_TIME_APP_ID,
  TRAVEL_TIME_API_KEY,
  GOOGLE_MAPS_API_KEY
} = require("../config/app-config.json");

module.exports = {
  User: {
    meetups: (parent, args, context, info) =>
      parent.getMeetups({ order: [["createdAt", "DESC"]] })
  },
  Meetup: {
    owner: (parent, args, context, info) => parent.getUser(),
    users: (parent, args, context, info) => parent.getUsers(),
    events: (parent, args, context, info) => parent.getEvents(),
    canEdit: (parent, args, { user }, info) =>
      parent.getUser().then(u => u.id === user.id),
    canDelete: (parent, args, { user }, info) =>
      parent.getUser().then(u => u.id === user.id)
  },
  Query: {
    /*latestPosts: (parent, { count, after }, { db }, info) => {
      if (after) {
        return db.post.findOne({ where: { id: after } }).then(post =>
          post
            ? db.post.findAll({
                where: {
                  createdAt: { [Op.lt]: post.createdAt }
                },
                limit: count,
                order: [["createdAt", "DESC"]]
              })
            : Promise.reject(new Error("The given post id doesn't exist"))
        );
      } else {
        return db.post.findAll({
          limit: count,
          order: [["createdAt", "DESC"]]
        });
      }
    },
    postsAfterTimestamp: (parent, { timestamp }, { db }, info) =>
      db.post.findAll({
        where: {
          createdAt: {
            [Op.gt]: new Date(timestamp * 1000)
          }
        }
      }),*/
    meetup: (parent, { id }, { db }, info) =>
      db.meetup.findOne({ where: { id } }),
    user: (parent, { id }, { db }, info) => db.user.findOne({ where: { id } }),
    me: (parent, { id }, { db, user }, info) => user
  },
  Mutation: {
    createMeetup: (
      parent,
      {
        title,
        description,
        categoryIds,
        travelTime,
        meansOfTransport,
        datetime,
        username,
        location
      },
      { db, user },
      info
    ) =>
      Promise.resolve()
        .then(() => {
          if (user) {
            //we're signed in and ready to go!
            return user;
          } else {
            //create a temporary user
            return db.user.create({ name: username, real: false });
          }
        })
        .then(user => {
          return db.meetup
            .create({ title, description, maxTravelTime: travelTime, datetime })
            .then(meetup =>
              fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                  location
                )}&key=${GOOGLE_MAPS_API_KEY}`
              )
                .then(response => response.json())
                .then(json => {
                  const {
                    lat: latitude,
                    lng: longitude
                  } = json.results[0].geometry.location;

                  return meetup.setEventCategories(categoryIds).then(() =>
                    db.meetupUsers
                      .create({
                        longitude,
                        latitude,
                        meansOfTransport,
                        userId: user.id,
                        meetupId: meetup.id
                      })
                      .then(() => queryEvents({ meetup }))
                      .then(events =>
                        Promise.all(
                          events.map(
                            ({
                              title,
                              lng,
                              lat,
                              start,
                              end,
                              price,
                              priceLevel,
                              rating,
                              types
                            }) =>
                              db.event
                                .create({
                                  title,
                                  latitude: lat,
                                  longitude: lng,
                                  description: "",
                                  start,
                                  end,
                                  price,
                                  priceLevel,
                                  rating,
                                  meetupId: meetup.id
                                })
                                .then(event =>
                                  db.eventCategory
                                    .findAll({
                                      where: {
                                        key: {
                                          [Op.or]: [types]
                                        }
                                      }
                                    })
                                    .then(categories =>
                                      event.setEventCategories(categories)
                                    )
                                    .then(() => event)
                                )
                          )
                        )
                      )
                      .then(events => ({
                        meetup,
                        events
                      }))
                  );
                })
            );
        }),
    updateMeetup: (parent, { id, title, description }, { db, user }, info) =>
      db.meetup.findOne({ where: { id } }).then(meetup => {
        if (!meetup) {
          return new NotFoundError();
        }

        if (meetup.userId !== user.id) {
          throw new MissingPermissionError();
        }

        //only update the post if the userId matches
        return db.meetup.update(
          {
            title,
            description
          },
          {
            where: {
              id,
              userId: user.id
            }
          }
        );
      }),
    deleteMeetup: (parent, { id }, { user, db }, info) =>
      db.meetup.findOne({ where: { id } }).then(meetup => {
        if (!meetup) {
          return new NotFoundError();
        }

        if (meetup.userId !== user.id) {
          throw new MissingPermissionError();
        }

        //only update the post if the userId matches
        return db.meetup.destroy({
          where: {
            id,
            userId: user.id
          }
        });
      })
  }
};
