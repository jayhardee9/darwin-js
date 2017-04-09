# darwin-js
![](https://travis-ci.org/jayhardee9/darwin-js.svg?branch=master)

A simple genetic algorithm framework for Node. Allows you to implement the genetic operators (selection, crossover and mutation),
and fitness function, and it handles the rest. The "chromosomes" can be any datatype whatsoever, and the fitness function can
either be synchronous or a Promise.

# Install

```
npm install --save darwin-js
```

# Usage
```js
var ga = require('darwin-js')

// Implement on your own
var options = {
  fitness: (individual) => { 
    // You have the option of returning a Promise here, if
    // G.A. needs to reach out to the user, say, for a 
    // subjective rating.
    return fitness
  },
  selection: (population) => {
    // Return an individual population[k].individual based on
    // population[k].fitness.
    var k = ...
    return population[k].individual
  },
  crossover: (parent1, parent2) => {
    // Combine parent1 and parent2 somehow
    return [child1, child2]
  },
  mutation: (individual) => {
    // Mutate individual (or return unchanged)
    ...
    return mutant
  },
  iterations: 10000,
  stop: (fitness) => {
    // Return true if fitness is high enough. Will
    // terminate G.A. even if it hasn't iterated 10000 times.
    return ...
  }
}

// Run genetic algorithm
ga.run(options).then((result) => {
  console.log('Best individual: ' + result.best.individual)
  console.log('Best individual\'s fitness: ' + result.best.fitness)
  console.log('Last population: %j', result.population)
}).catch((err) => {
  console.log('Oops: ' + err)
})
```

# API
TODO. See tests for an example for now.
