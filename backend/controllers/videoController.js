const {
  createVideoValidation,
  updateVideoValidation,
  deleteVideoValidation,
  linkVideoValidation,
} = require("../middleware/validation");
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
  const params = {nombre_video, enlace_video};

  const { error } = createVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createVideo(params)
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
  const params = { nombre_video, enlace_video, id_video}

  const { error } = updateVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateVideo(params)
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
  const params = {id_video}

  const { error } = deleteVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteVideo(params)
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

    const params = {id_video, id_ejercicio, forceReplace}

    const { error } = linkVideoValidation(params);
    if (error) throw { message: error.details[0].message, statusCode: 400 };


    linkVideoToExercise(params)
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
    const params = {id_video}

    const { error } = deleteVideoValidation(params);
    if (error) throw { message: error.details[0].message, statusCode: 400 };

    unlinkVideoFromExercise(params)
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