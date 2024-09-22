// routes/index.js
import router from '../../router.js';

router.get('/lol', (req, res) => {
  try {
    // Your logic here. If an error occurs in this block, it will be caught
    // and a 500 status code will be returned.
    return res.send('hi').status(200);
  } catch {
    return res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

router.get('/error', () => {
  throw new Error('This is an error message');
});

export default router;
