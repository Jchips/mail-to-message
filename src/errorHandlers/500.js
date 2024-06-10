'use strict';

function handle500(err, req, res, next) {
  const error = err.message ? err.message : err;

  const errorObject = {
    status: 500,
    message: error,
  };

  try {
    res.status(500).json(errorObject);
  } catch (err) {
    next(err);
  }
}

module.exports = handle500;
