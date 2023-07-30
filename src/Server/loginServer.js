const path = require('path');
const { app, client } = require('./mainServer');
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/submit', async (req, res) => {

    const { username, password } = req.body;


    const result = await client.query(
        'SELECT id ,username, password, department FROM users WHERE username = $1 AND password = $2',
        [username, password]
    );

    if (result.rowCount === 1) {
        const now = new Date();
        client.query('UPDATE users SET last_login = $1 WHERE username = $2', [now, username], (err, result) => {
            if (err) {

                res.status(500).send(JSON.stringify({ message: 'failure' }));
            } else {

            }
        });
        if (result.rows[0].department === "Admin") {

            req.session.userId = result.rows[0].id;
            res.status(200).send(JSON.stringify({ message: 'success', redirect: '/admin' }));


        }
        else {
            req.session.userId = result.rows[0].id;
            res.status(200).send(JSON.stringify({ message: 'success', redirect: '/instructor' }));
        }



    }
    else {

        res.status(401).send(JSON.stringify({ message: 'failure' }));

    }

});

app.get('/admin',  (req, res) => {
    const location = path.join(__dirname, '..', 'Admin' , 'AdminPanelPage','admin_panel.html')
    res.sendFile(location);

});

app.get('/admin_panel.css', (req, res) => {
    const location = path.join(__dirname, '..', 'Admin' , 'AdminPanelPage','admin_panel.css')
    res.sendFile(location);

});
app.get('/instructor',  (req, res) => {
    const location = path.join(__dirname, '..', 'Instructor' , 'InstructorPanelPage','instructor_panel.html')
    res.sendFile(location);

});
app.get('/instructor_panel.css',  (req, res) => {
    const location = path.join(__dirname, '..', 'Instructor' , 'InstructorPanelPage','instructor_panel.css')
    res.sendFile(location);

});
app.get('/tablecourses.js',  (req, res) => {
    const location = path.join(__dirname, '..', 'Instructor' , 'InstructorPanelPage','tablecourses.js')
    res.sendFile(location);

});

app.get('/nameAndSurname', (req, res) => {
    const userId = req.session.userId;
    client.query(
        'SELECT name, surname FROM users WHERE id = $1',
        [userId],
        (error, result) => {
            if (error) {
                res.status(500).send(error.message);
            } else if (result.rows.length === 0) {
                res.send('User not found');
            } else {
                const user = result.rows[0];
                res.send(user.name + " " + user.surname);
            }
        }
    );
});
app.get('/logout', function (req, res) {

    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {

            res.redirect('/');
        
        }
    });
});


exports.app = app
exports.client = client
const adminServer = require('./adminServer')
const instructorServer = require('./instructorServer')