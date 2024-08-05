// server.js
import app from './app.js';

const port = 3000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening at port ${port}...`);
});
