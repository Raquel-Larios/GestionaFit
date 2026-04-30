const {
  createVideo,
  updateVideo,
  deleteVideo,
  linkVideoToExercise,
  unlinkVideoFromExercise,
  getLinksVideo_Exercise,
} = require("../models/videoModel");

exports.createVideoControl = (req, res, next) => {
  const { nombre_video, enlace_video } = req.body;

  createVideo({ nombre_video, enlace_video })
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
  const id_video = parseInt(req.params.id_video, 10);
  const { nombre_video, enlace_video } = req.body;

  updateVideo({ nombre_video, enlace_video, id_video })
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
  const id_video = parseInt(req.params.id_video, 10);

  deleteVideo({ id_video })
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
    const id_video = parseInt(req.params.id_video, 10);
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    let { forceReplace } = req.body || {};

    linkVideoToExercise({ id_video, id_ejercicio, forceReplace })
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
    const id_video = parseInt(req.params.id_video, 10);

    unlinkVideoFromExercise({ id_video})
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

  getLinksVideo_Exercise({})
  .then((result) => {
    res.json(result);
  })
  .catch((err) => {
    res.status(500).json({ error: err.message });
  })
}