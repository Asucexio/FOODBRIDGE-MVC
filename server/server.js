const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`FoodBridge API listening on port ${env.port}`);
  console.log(`http://localhost:${env.port}`);
});