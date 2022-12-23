import app from './app';

require('dotenv');
const PORT = 8000 || process.env.PORT;

app.listen(`Server is running port ${PORT}`);
