exports.get404 = (req, res) => {
  res
    .status(404)
    .render("404", {
      docTitle: "Page not found",
      path: "/404",
      isAuthenticated: req.isLoggedIn,
    });
};

exports.get500 = (req, res) => {
  res
    .status(500)
    .render("500", {
      docTitle: "Internal server error",
      path: "/500",
      isAuthenticated: req.isLoggedIn,
    });
};

exports.errorHandler = (err) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  next(error);
};
