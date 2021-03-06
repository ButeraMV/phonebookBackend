require('dotenv').config();
const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

app.use(express.static('build'));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('tiny'));

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons.map(person => person.toJSON()));
  });
});

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then((person) => {
    res.json(person.toJSON());
  });
});

app.post('/api/persons', (req, res, next) => {
  const { body } = req;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then((savedAndFormattedPerson) => {
      res.json(savedAndFormattedPerson);
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { body } = req;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson.toJSON());
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

// app.get('/api/info', (req, res) => {
//   res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`);
// });

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT)
