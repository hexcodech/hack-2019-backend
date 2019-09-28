const uuidv5 = require("uuid/v5");
const fetch = require("node-fetch");
const enclose = require("circle-enclose");
const inside = require("point-in-polygon");

const {
  TRAVEL_TIME_APP_ID,
  TRAVEL_TIME_API_KEY,
  GOOGLE_MAPS_API_KEY
} = require("../config/app-config.json");
const { makeCircle } = require("./smallest-enclosing-circle");
const db = require("../models");

const drawRandomPoint = pointCopiesPrefixSum => {
  const numberOfPoints = pointCopiesPrefixSum[pointCopiesPrefixSum.length - 1];
  const randomPointPrefixIndex = Math.floor(Math.random() * numberOfPoints);

  return (randomPointIndex = pointCopiesPrefixSum.findIndex(
    (prefixSum, index) =>
      randomPointPrefixIndex < prefixSum &&
      (index === 0 || randomPointPrefixIndex > pointCopiesPrefixSum[index - 1])
  ));
};

const drawRandomPoints = (shells, pointCopiesPrefixSum) => {
  const points = [];
  for (let i = 0; i < 11; i++) {
    points[i] = shells[drawRandomPoint(pointCopiesPrefixSum)];
  }

  return points;
};

const smallestEnclosingCircle = shell => {
  const pointCopies = new Array(shell.length).fill(1);
  const pointCopiesPrefixSum = [pointCopies[0]];

  while (true) {
    for (let i = 1; i < pointCopies.length; i++) {
      pointCopiesPrefixSum[i] = pointCopiesPrefixSum[i - 1] + pointCopies[i];
    }

    const randomPoints = drawRandomPoints(shells, pointCopiesPrefixSum); // 11 points
    //calculate circle (randomPoints)

    const { x, y, r } = enclose(
      randomPoints.map(p => ({ x: p.lng, y: p.lat }))
    );
    const circle = { lng: x, lat: y, r };

    const outlierIndices = shell
      .map((point, index) => {
        const distance = Math.sqrt(
          Math.pow(point.lat - circle.lat, 2) +
            Math.pow(point.lng - circle.lng, 2)
        );
        return distance < circle.radius ? index : null;
      })
      .filter(s => s);

    if (outlierIndices.length === 0) {
      return circle;
    }

    //else
    outlierIndices.forEach(index => (pointCopies[index] *= 2));
  }
};

module.exports.queryEvents = ({ meetup }) => {
  const id = uuidv5("meetup.tyratox.ch", uuidv5.DNS);

  Promise.all(
    db.meetupUsers.findAll({ where: { meetupId: meetup.id } }),
    meetup.getEventCategories()
  )
    .then(([meetupUsers, categories]) => {
      if (!meetupUsers || meetupUsers.length == 0) {
        return Promise.reject("No users are assigned to this meetup!");
      }

      return meetupUsers.map((meetupUser, index) => ({
        id: `${id}.${index}`,
        coords: { lng: meetupUser.longitude, lat: meetupUser.latitude },
        transportation: {
          type: meansOfTransport,
          pt_change_delay: 0,
          walking_time: 900,
          driving_time_to_station: 0,
          cycling_time_to_station: 900,
          parking_time: 0,
          boarding_time: 0
        },
        travel_time: meetup.maxTravelTime,
        departure_time: meetup.datetime,
        properties: ["is_only_walking"]
      }));
    })
    .then(departureSearches => {
      const requestObject = {
        departure_searches: departureSearches,
        intersections: [
          {
            id: `${id}.intersection`,
            search_ids: new Array(departureSearches)
              .fill()
              .map((_, index) => `${id}.${index}`)
          }
        ]
      };

      return fetch("api.traveltimeapp.com/v4/time-map", {
        method: "post",
        body: JSON.stringify(requestObject),
        headers: {
          "Content-Type": "application/json",
          "X-Application-Id": TRAVEL_TIME_APP_ID,
          "X-Api-Key": TRAVEL_TIME_API_KEY
        }
      })
        .then(response => response.json())
        .then(json => {
          const { shell, holes } = json.results.find(result =>
            result.search_id.includes("intersection")
          ).shapes;

          const {
            lng: longitude,
            lat: latitude,
            r: radius
          } = smallestEnclosingCircle(shell);
          //multiply the radius by 1.5 in order to include more events
          radius *= 1.5;

          //fetch events in this area for each category
          return Promise.all(
            categories
              .map(category =>
                fetch(
                  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${category.key}&key=${GOOGLE_MAPS_API_KEY}`,
                  {
                    headers: { "Content-Type": "application/json" }
                  }
                )
              )
              .then(response => response.json())
          )
            .then(jsons => [].concat.apply([], jsons.map(json => json.results)))
            .then(events => {
              //Now filter the events in order to check whether they are inside our complex polygon

              //first convert the polygon in the correct format
              const polygon = shell.map(point => [point.lng, point.lat]);
              const polygonHoles = holes.map(hole =>
                hole.map(point => [point.lng, point.lat])
              );

              return events
                .filter(event =>
                  inside(
                    [event.geometry.location.lng, event.geometry.location.lat],
                    polygon
                  )
                )
                .filter(
                  event =>
                    !polygonHoles.find(hole =>
                      inside(
                        [
                          event.geometry.location.lng,
                          event.geometry.location.lat
                        ],
                        hole
                      )
                    )
                );
            })
            .then(events =>
              events.map(event => ({
                title: event.name,
                lng: event.geometry.location.lng,
                lat: event.geometry.location.lat,
                start: null,
                end: null,
                price: null,
                priceLevel: event.price_level,
                rating: event.rating,
                types: event.types
              }))
            );
        });
    });
};
