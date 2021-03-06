'use strict';

import riot from 'riot-node';
import from '../app/components/main';
import fruitStore from '../app/stores/fruit-store';

import express from 'express';

import Q from 'q';
import FS from 'fs';

import routes from '../app/routes';

let app = express();

let publicFiles = [];

// Escape the SystemJS dir
app.use(express.static(process.env.APP_BASE_PATH + "/public"));

// Riot app template engine
app.engine('html', function (filePath, options, callback) { 
    Q.spawn(function* () {
        try {
            let view = riot.render(options.mainTag, options.tagOpts);
            let regex = new RegExp('<' + options.mainTag + '.*<\/' + options.mainTag + '>');
            // Loading HTML file
            let content = yield Q.denodeify(FS.readFile)(filePath);
            let rendered = content.toString().replace(regex, view);
            return callback(null, rendered);
        }
        catch (e) {
            console.log("App engine error: ", e, " Filepath: ", filePath);
            return callback(e);
        }
    });
})

app.set('views', './build/'); // specify the views directory
app.set('view engine', 'html'); // register the template engine

app.use(function (req, res, next) {
    next(); // Process routes
    // don't render view for file requests (Currently just looks for a file extension)
    if(!req.path.match(/^.*\.[\w]+$/)) {
        res.render('index', {mainTag: 'main', tagOpts: {fruitStore: fruitStore}});
    }
});


routes.runRoutingTable(app);

let server = app.listen(3000, function () {

    let host = server.address().address
    let port = server.address().port

    console.log('Node app listening at http://%s:%s', host, port);
});



