import app from './app';

require('dotenv');
const PORT = 8000;

app.listen(8000, ()=>{
    console.log(`Server is running port ${PORT}`);
});
