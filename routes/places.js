var express = require("express");
var router = express.Router();

require("../models/connection");
const Place = require("../models/places");
const { checkBody } = require("../modules/checkBody");

router.post("/", (req, res) => {
    console.log(req.body);
  if (!checkBody(req.body, ["nickname", "name", "latitude", "longitude"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const { nickname, name, latitude, longitude } = req.body;
  const nameRegex = new RegExp(`^${name}$`, "i");
  console.log("nameRegex", nameRegex);
  Place.findOne({
    nickname,
    name: { $regex: nameRegex },
  }).then((data) => {
    if (data) {
      res.json({ result: false, error: "Place already exists" });
      return;
    }
    const newPlace = new Place({
        nickname,
        name,
        latitude,
        longitude,
      });
      newPlace.save().then((data) => {
        if (data) {
          res.json({ result: true });
        } else {
          res.json({ result: false, error: "Error when saving place in db" });
        }
      });
  });
  
});

router.get("/:nickname", (req, res) => {
  const nickname = req.params.nickname;

  Place.find({ nickname }).then((data) => {
    if (data) {
      res.json({
        result: true,
        places: data.map((pl) => {
          return {
            nickname: pl.nickname,
            name: pl.name,
            latitude: pl.latitude,
            longitude: pl.longitude,
          };
        }),
      });
    } else {
      res.json({
        result: false,
        error: `no places registered for user ${nickname}`,
      });
    }
  });
});

router.delete("/", (req, res) => {
  if (!checkBody(req.body, ["nickname", "name"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const { nickname, name } = req.body;
  const nameRegex = new RegExp(`^${name}$`, "i");
  Place.deleteOne({
    nickname,
    name: { $regex: nameRegex },
  }).then((data) => {
    if (data) {
      res.json({ result: true });
    } else {
      res.json({
        result: false,
        error: "Place does not exist or database error",
      });
    }
  });
});

module.exports = router;
