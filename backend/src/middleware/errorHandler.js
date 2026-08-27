function notFound(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
}

function errorHandler(error, _request, response, _next) {
  console.error(error);

  if (error.name === "ValidationError") {
    return response.status(422).json({ message: error.message });
  }

  if (error.code === 11000) {
    return response.status(409).json({ message: "Email or phone already exists" });
  }

  return response.status(error.statusCode || 500).json({
    message: error.message || "Internal server error"
  });
}

module.exports = { notFound, errorHandler };
