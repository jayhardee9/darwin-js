var alphabet = 'abcdefghijklmnopqrstuvwxyz !,'
var targetString = 'hello, world!'

var randomStrings = function (size, count) {
  var strings = []
  for (var i = 0; i < count; i++) {
    var string = ''
    for (var j = 0; j < size; j++) {
      var charsIdx = Math.floor(Math.random() * alphabet.length)
      string += alphabet[charsIdx]
    }
    strings.push(string)
  }
  return strings
}

module.exports = {
  population: randomStrings(targetString.length, 100),

  mutation: function (individual) {
    var mutant = ''
    for (var i = 0; i < individual.length; i++) {
      if (Math.random() > 0.05) {
        mutant += individual.charAt(i)
      } else {
        var idx = (alphabet.length + alphabet.indexOf(individual.charAt(i)) + (Math.random() < 0.5 ? 1 : -1)) % alphabet.length
        mutant += alphabet.charAt(idx)
      }
    }
    return mutant
  },

  fitness: function (individual) {
    return new Promise(function (resolve, reject) {
      var fitness = 0
      for (var i = 0; i < individual.length; i++) {
        fitness += Math.abs(alphabet.indexOf(individual.charAt(i)) - alphabet.indexOf(targetString.charAt(i)))
      }
      resolve(individual.length * (alphabet.length - 1) - fitness)
    })
  },

  selection: function (popWithFitnesses) {
    var fitnessSum = popWithFitnesses.reduce((acc, val) => acc + val.fitness, 0)
    var p = Math.floor(Math.random() * fitnessSum)

    for (var i = 0; i < popWithFitnesses.length; i++) {
      p -= popWithFitnesses[i].fitness
      if (p <= 0) {
        return popWithFitnesses[i].individual
      }
    }

    return popWithFitnesses[popWithFitnesses.length - 1].individual
  },

  crossover: function (parent1, parent2) {
    var child1 = ''
    var child2 = ''

    if (Math.random() > 0.2) {
      return [parent1, parent2]
    }

    for (var i = 0; i < parent1.length; i++) {
      if (Math.random() < 0.5) {
        child1 += parent1.charAt(i)
        child2 += parent2.charAt(i)
      } else {
        child1 += parent2.charAt(i)
        child2 += parent1.charAt(i)
      }
    }

    return [child1, child2]
  },

  stop: function (fitness) {
    return fitness >= targetString.length * (alphabet.length - 1)
  },

  stats: function (stats) {
    console.log('%d,%d,%s', stats.maxFitness, stats.meanFitness,
      stats.bestIndividual.toString())
  },

  elitist: true
}
