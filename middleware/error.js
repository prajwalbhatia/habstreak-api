const errorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } 


  res.status(err.status || 500);
  res.send({
    error: {
      message: err.message,
      statck: process.env.NODE_ENV === 'production' ? null : err.stack,
      status: err.status || 500
    }
  });

  next();
}

export default errorHandler;