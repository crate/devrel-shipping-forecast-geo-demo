import 'dotenv/config';
import express from 'express';
import crate from 'node-crate';
import wellknown from 'wellknown';

const { PORT, CRATE_URL } = process.env;

// Connect to CrateDB.
crate.connect(CRATE_URL);

// Initialize Express.
const app = express();
app.set('views', new URL('./views', import.meta.url).pathname);
app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(express.json());

// Serve the home page.
app.get('/', async (req, res) => {
  return res.render('homepage');
});

// Perform a geospatial search and return the results.
app.post('/search', async (req, res) => {
  try {
    let results;
    
    // Let's see what sort of request this is...
    if (req.body.point) {
      // Simple point.
      const wktString = `POINT(${req.body.point.lng} ${req.body.point.lat})`;
      results = await crate.execute(
        'SELECT name, boundaries, forecast from shipping_forecast.regions WHERE WITHIN(?, boundaries) LIMIT 1',
        [ wktString ]
      );
    } else if (req.body.shape) {
      // User supplied a shape (polygon or polyine)
      // Expects the body to be a GeoJSON representation:
      // https://en.wikipedia.org/wiki/GeoJSON
      const wktString = wellknown.stringify(req.body.shape);
      results = await crate.execute(
        'SELECT * FROM shipping_forecast.regions WHERE INTERSECTS(?, boundaries)',
        [ wktString ]
      );
    }

    return res.json({ data: results.json });
  } catch (e) {
    // Probably an unparsable polygon.
    console.error(e);
    return res.json({ data: [] });
  }
});

// Start the Express server.
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});