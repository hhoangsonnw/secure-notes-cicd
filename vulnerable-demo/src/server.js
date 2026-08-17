const app = require("./app");

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Insecure Notes demo app is running on port ${port}`);
});
