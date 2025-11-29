const {
  createVideo,
  updateVideo,
  deleteVideo,
  linkVideoToExercise,
  unlinkVideoFromExercise,
} = require("../models/videoModel");

exports.createVideoControl = (req, res, next) => {
  const { nombre, enlace } = req.body;

  createVideo({ nombre, enlace })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

exports.updateVideoControl = (req, res, next) => {
  const { nombre, enlace } = req.body;
  const videoId = req.params.id;

  updateVideo({ nombre, enlace, videoId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

exports.deleteVideoControl = (req, res, next) => {
  const videoId = req.params.id;

  deleteVideo({ videoId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

exports.linkVideoToExerciseControl = (req, res, next) => {
    const videoId = req.params.videoId;
    const ejercicioId = req.params.ejercicioId;

    linkVideoToExercise({ videoId, ejercicioId })
    .then((result) => {
        const {statusCode = 200, message , data} = result;
        res.status(statusCode).send({message, data });
    })
    .catch((err) => {
        const {statusCode, message, data, code} = err;
        res.status(statusCode).send({ message, data, code}) && next(err);
    })
};

exports.unlinkVideoFromExerciseControl = (req, res, next) => {
    const videoId = req.params.videoId;

    unlinkVideoFromExercise({ videoId })
    .then((result) => {
        const {statusCode = 200, message , data} = result;
        res.status(statusCode).send({message, data });
    })
    .catch((err) => {
        const {statusCode, message, data, code} = err;
        res.status(statusCode).send({ message, data, code}) && next(err);
    })
};

exports.getLinksVideo_ExerciseControl = (req, res) => {

  this.getLinksVideo_Exercise({})
  .then((result) => {
    res.json(result);
  })
  .catch((err) => {
    throw err;
  })
}