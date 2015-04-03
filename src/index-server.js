'use strict';

import riot from 'riot-node';
import from './components/main';
import fruitStore from './stores/fruit-store';

import express from 'express';

import Q from 'q';
import FS from 'fs';

import routes from './routes';
import cheerio from 'cheerio';

let app = express();
let layoutHTML;


// Escape the SystemJS dir
let baseDir = __dirname + "../../../../../";

app.use(express.static(baseDir + "../public"));

app.use(function (req, res, next) {
    next(); // Process routes
    console.log("Sending app");
    let view = riot.render('main', {
            fruitStore: fruitStore
    });
    let renderLayout = cheerio.load(layoutHTML);
    renderLayout('body').append(view);
    res.send(renderLayout.html());
});


routes.runRoutingTable(app);

let server = app.listen(3000, function () {

    let host = server.address().address
    let port = server.address().port

    console.log('Node app listening at http://%s:%s', host, port);
});

Q.spawn(function* () {
    try {
        console.log("Loading index.html layout");
        // Loading static HTML file
        layoutHTML = yield Q.denodeify(FS.readFile)("./index.html");
        layoutHTML = layoutHTML.toString().trim();
    }
    catch (e) {
        console.log("Error", e);
    }
});

