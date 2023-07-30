const path = require('path');
const mime = require('mime');
const bodyParser = require('body-parser');

const { app, client } = require('./loginServer')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/admin_listofusers', (req, res) => {
    const location = path.join(__dirname, '..', 'Admin', 'AdminListOfUsers', 'admin_listofusers.html')
    res.sendFile(location);

});

app.get('/table.js', (req, res) => {
    const location = path.join(__dirname, '..', 'Admin', 'AdminListOfUsers', 'table.js')
    res.sendFile(location);

});
app.get('/admin_listofusers.css', (req, res) => {
    const location = path.join(__dirname, '..', 'Admin', 'AdminListOfUsers', 'admin_listofusers.css')
    res.sendFile(location);

});

app.get('/admin_adduser', (req, res) => {
    const location = path.join(__dirname, '..', 'Admin', 'AdminAddUserPage', 'admin_adduser.html')
    res.sendFile(location);

});

app.get('/admin_adduser.css', (req, res) => {
    const location = path.join(__dirname, '..', 'Admin', 'AdminAddUserPage', 'admin_adduser.css')
    res.sendFile(location);

});

app.get('/admin_addcourse', (req, res) => {
    const location = path.join(__dirname, '..', 'Admin', 'AdminAddCourse', 'admin_addcourse.html')
    res.sendFile(location);

});

app.get('/admin_addcourse.css', (req, res) => {
    const location = path.join(__dirname, '..', 'Admin', 'AdminAddCourse', 'admin_addcourse.css')
    res.sendFile(location);

});


app.get('/totalAdminUsers', (req, res) => {
    client.query('SELECT COUNT(*) FROM users WHERE department = $1', ['Admin'], (error, result) => {
        if (error) {
            res.status(500).send(error.message);
        } else {
            const count = result.rows[0].count;
            res.send(count);
        }
    });
});
app.get('/totalPersonUsers', (req, res) => {
    client.query('SELECT COUNT(*) FROM users WHERE department = $1', ['Instructor'], (error, result) => {
        if (error) {
            res.status(500).send(error.message);
        } else {
            const count = result.rows[0].count;
            res.send(count);
        }
    });
});
app.get('/totalNumUsers', (req, res) => {
    client.query('SELECT COUNT(*) FROM users', (error, result) => {
        if (error) {
            res.status(500).send(error.message);
        } else {
            const count = result.rows[0].count;
            res.send(count);
        }
    });
});
app.post('/adduser', (req, res) => {
    const { name, surname, username, password, department } = req.body;
    client.query('INSERT INTO users (name, surname, username, password, department) VALUES ($1, $2, $3, $4, $5)', [name, surname, username, password, department], (error, result) => {
        if (error) {

            res.status(500).send(JSON.stringify({ message: 'failure', redirect: '/admin_adduser' }));

        } else {

            res.status(200).send(JSON.stringify({ message: 'success', redirect: '/admin_adduser' }));

        }
    });
});
app.get('/userLogin', (req, res) => {
    client.query('SELECT * FROM users WHERE last_login IS NOT NULL ORDER BY last_login DESC', (err, dbRes) => {
        if (err) {
            console.error(err);
            res.send(err);
            return;
        }
        res.json(dbRes.rows);
    });
});

app.get('/department', (req, res) => {
    const department = req.query.department;

    client.query(
        'SELECT * FROM users WHERE department = $1',
        [department],
        (error, result) => {
            if (error) {
                res.status(500).send(error.message);
            } else {
                const users = result.rows;
                console.log(users)
                res.send(JSON.stringify(users));
            }
        }
    );
});
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    client.query('SELECT * FROM users WHERE id = $1', [userId], (error, result) => {
        if (error) {
            res.status(500).send(error.message);
        } else if (result.rows.length === 0) {
            res.status(404).send(`User with ID ${userId} not found`);
        } else {
            const user = result.rows[0];
            res.send(user);
        }
    });
});


app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    client.query(
        'DELETE FROM users WHERE id = $1',
        [userId],
        (error, result) => {
            if (error) {
                res.status(500).send(error.message);
            } else if (result.rowCount === 0) {
                res.status(404).send('User not found');
            } else {
                res.send(`User with ID ${userId} deleted successfully`);
            }
        }
    );
});

app.get('/getInstructors', (req, res) => {
    const query = 'SELECT id, name, surname FROM users WHERE department = $1';
    const values = ['Instructor'];

    // Execute the query with parameterized values
    client.query(query, values, (err, dbRes) => {
        if (err) {
            console.error(err);
            res.send(err);
            return;
        }

        res.json(dbRes.rows);
    });
});


app.get('/instructorAndCourse', (req, res) => {
    const query = `
    SELECT
    users.id,
    users.name || ' ' || users.surname AS full_name,
    COUNT(courses_basic.id) AS total_number_of_courses
FROM
    users
LEFT JOIN
    courses_basic ON users.id = courses_basic.user_id
WHERE
    users.department = 'Instructor'
GROUP BY
    users.id;
    `;

    client.query(query)
        .then(result => {
            res.json(result.rows);
        })
        .catch(error => {
            console.error('Database Error:', error);
            res.sendStatus(500);
        });
});

app.post('/addCourseInfo', (req, res) => {
    const { course_id, name, instructor_id } = req.body;
    const createdAt = new Date();
    const updatedAt = new Date();
  
    const query = `
      INSERT INTO courses_basic (course_code, course_title, user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [course_id, name, instructor_id, createdAt, updatedAt];
  
    client.query(query, values)
      .then(result => {
        const addedCourse = result.rows[0];
        res.status(201).json(addedCourse);
      })
      .catch(error => {
        console.error('Database Error:', error);
        res.sendStatus(500);
      });
  });
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
module.exports = app