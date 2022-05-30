const Movie = require('../models/movie');
const ValidationError = require('../errors/validationError');
const RoleError = require('../errors/roleError');
const ObjectNotExistError = require('../errors/objectNotExistError');

const MOVIE_OWNER = 'owner';

function errorHandler(err, next) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    next(new ValidationError(err.message));
  } else {
    next(err);
  }
}

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .populate(MOVIE_OWNER)
    .then((movies) => res.send({ movies }))
    .catch((err) => {
      errorHandler(err, next);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .populate(MOVIE_OWNER)
    .then((movie) => {
      if (movie) {
        if (movie.owner.equals(req.user._id)) {
          return Movie.deleteOne({ _id: req.params.movieId })
            .then(() => {
              res.send({ message: `Фильм с id:${req.params.movieId} удален` });
            });
        }
        throw new RoleError('У вас нет прав на удаление фильма.');
      } else {
        throw new ObjectNotExistError('Фильма с таким id не существует.');
      }
    })
    .catch((err) => {
      errorHandler(err, next);
    });
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailerLink, thumbnail, movieId, nameRU, nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => res.send({ movie }))
    .catch((err) => {
      errorHandler(err, next);
    });
};
