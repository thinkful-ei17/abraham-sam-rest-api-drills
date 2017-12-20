'use strict';

const express = require('express');
// we'll use morgan to log the HTTP layer
const morgan = require('morgan');
// we'll use body-parser's json() method to 
// parse JSON data sent in requests to this app
const bodyParser = require('body-parser');

// we import the ShoppingList model, which we'll
// interact with in our GET endpoint
const {ShoppingList, Recipes} = require('./models');

const jsonParser = bodyParser.json(); 
const app = express();

// log the http layer
app.use(morgan('common'));


// we're going to add some items to ShoppingList
// so there's some data to look at. Note that 
// normally you wouldn't do this. Usually your
// server will simply expose the state of the
// underlying database.
ShoppingList.create('beans', 2);
ShoppingList.create('tomatoes', 3);
ShoppingList.create('peppers', 4);

Recipes.create('chocolate milk', ['milk','cocoa powder','sugar']);
Recipes.create('oatmeal',['hot water','oats','fresh strawberries']);
Recipes.create('peanut butter and jelly sandwich', ['peanut butter', 'jelly', 'bread']);

// when the root of this route is called with GET, return
// all current ShoppingList items by calling `ShoppingList.get()`
app.get('/shopping-list', (req, res) => {
  res.json(ShoppingList.get());
});

app.post('/shopping-list', jsonParser, (req, res) => {
  // ensure `name` and `budget` are in request body
  const requiredFields = ['name', 'budget'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const item = ShoppingList.create(req.body.name, req.body.budget);
  res.status(201).json(item);
});

app.delete('/shopping-list/:id', (req, res) => {
  ShoppingList.delete(req.params.id);
  console.log(`Deleted shopping list item \`${req.params.id}\``);
  res.status(204).end();
});

app.put('/shopping-list/:id', jsonParser, (req, res) => {
  const requiredFields = ['name', 'budget', 'id'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating shopping list item \`${req.params.id}\``);
  ShoppingList.update({
    id: req.params.id,
    name: req.body.name,
    budget: req.body.budget
  });
  res.status(204).end();
});

app.get('/recipes', (req, res) => {
  res.json(Recipes.get());
});

app.post('/recipes', jsonParser, (req, res)=>{
  const requiredFields = ['name', 'ingredients'];
  for(let i=0; i<requiredFields.length; i++){
    const field = requiredFields[i];
    if(!(field in req.body)){
      const message = `Missing '${field}' in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const {name, ingredients} = req.body;
  const item = Recipes.create(name, ingredients);
  res.status(201).json(item);
});

app.delete('/recipes/:id', (req, res) => {
  Recipes.delete(req.params.id);
  res.status(204).end();
});

app.put('/recipes/:id', jsonParser, (req, res) =>{
  const requiredFields = ['name','ingredients','id'];
  for(let i=0; i<requiredFields.length; i++){
    const field = requiredFields[i];
    if(!(field in req.body)){
      const message = `Missing '${field}' in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if(req.params.id !== req.body.id){
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }

  const {name, id, ingredients} = req.body;
  Recipes.update({name, id, ingredients});
  res.status(204).end();  
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
