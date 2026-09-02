function notFound(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
}

function errorHandler(error, _request, response, _next) {
  console.error(error);

  if (error.name === "ValidationError") {
    return response.status(422).json({ message: error.message });
  }

  if (error.code === 11000) {
    if (error.keyPattern?.phone || error.keyValue?.phone) {
      return response.status(409).json({ message: "This phone number is already registered" });
    }
    return response.status(409).json({ message: "This account detail already exists" });
  }

  return response.status(error.statusCode || 500).json({
    message: error.message || "Internal server error"
  });
}

module.exports = { notFound, errorHandler };
