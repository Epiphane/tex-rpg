import * as http from 'http';

const server = http.createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.write('Hi there!\nReady to have some fun?\n\n');
    res.write(`Url: ${req.url}`);
    res.end();
});

const port = process.env.PORT || 8080;
console.log(`Listening on port ${port}`);
server.listen(port);