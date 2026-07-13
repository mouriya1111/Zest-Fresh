function notFound(request, response) {
  response.status(404).json({ success: false, message: `Route not found: ${request.method} ${request.originalUrl}` });
}

function errorHandler(error, _request, response, _next) {
  console.error(error);

  if (error.name === "ValidationError") {
    return response.status(422).json({ success: false, message: error.message });
  }

  if (error.code === 11000) {
    return response.status(409).json({ success: false, message: "Email or phone already exists" });
  }

  return response.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error"
  });
}

module.exports = { notFound, errorHandler };
