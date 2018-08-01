const handle404 = (err, req, res, next) => {
  if (err.status === 404) res.status(404).send({ message: 'Could not find the requested resource' });
  else next(err);
};

module.exports = { handle404 };
