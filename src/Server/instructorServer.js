const path = require('path');
const mime = require('mime');
const bodyParser = require('body-parser');

const {app,client} = require('./loginServer')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/coursesForInstructor', (req, res) => {
    const userId = req.session.userId;
    const query = `
      SELECT id, course_code, course_title
      FROM courses_basic
      WHERE user_id = $1
    `;
    const values = [userId];
  
    client.query(query, values)
      .then(result => {
        const courses = result.rows;
        res.status(200).json(courses);
      })
      .catch(error => {
        console.error('Database Error:', error);
        res.sendStatus(500);
      });
  });

  app.get('/learningOutcomes/:courseId', (req, res) => {
    const courseId = req.params.courseId;
  
    client.query('SELECT * FROM learning_outcomes WHERE course_id = $1', [courseId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(results.rows);
      }
    });
  });
  
  app.post('/addlearningOutcomes', (req, res) => {
    const { learning_outcome, course_id } = req.body;
  
    // Insert the learning outcome into the PostgreSQL table
    const query = 'INSERT INTO learning_outcomes (learning_outcome, course_id) VALUES ($1, $2) RETURNING *';
    const values = [learning_outcome, course_id];
  
    client.query(query, values, (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        // Return the inserted row as the response
        const insertedOutcome = result.rows[0];
        res.json(insertedOutcome);
      }
    });
  });


  app.get('/getLearningOutComes/:courseId', (req, res) => {
    const courseId = req.params.courseId;
  
    client.query('SELECT * FROM learning_outcomes WHERE course_id = $1', [courseId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(results.rows);
      }
    });
  });


  app.get('/getCheckboxesData/:learningOutcomeId', (req, res) => {
    const learningOutcomeId = req.params.learningOutcomeId;
  
    // Fetch checkbox data based on the learning outcome ID
    const query = `
    SELECT ms.id, so.description_of_outcome, ms.isSelected
    FROM mapping_SO ms
    INNER JOIN student_outcome so ON so.id = ms.student_outcome_id
    WHERE ms.learning_outcome_id = $1;
    
    `;
    const values = [learningOutcomeId];
  
    client.query(query, values)
      .then(result => {
        const checkboxesData = result.rows;
  
        // Send the checkbox data as a JSON response
        res.json(checkboxesData);
      })
      .catch(error => {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  });
  

  app.post("/update_mappings", function(req, res) {
    var checkboxData = req.body;
  console.log(checkboxData)
    // Use the checkboxData to update the mappings_SO table
    checkboxData.forEach(function(checkbox) {
      var id = checkbox.id;
      var isChecked = checkbox.checked;
  
      // Update the database with the id and isChecked values
      client.query('UPDATE mapping_SO SET isSelected = $1 WHERE id = $2',
        [isChecked, id], (error, result) => {
          if (error) {
            console.error('Error updating mapping with ID', id, error);
          } else {
            console.log('Mapping with ID', id, 'updated successfully');
          }
        }
      );
    });
  
    res.sendStatus(200);
  });
  
module.exports = app