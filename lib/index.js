var zip, selectNextPop, applyCrossover, runHelper

// config.population must be an even size
module.exports.run = (config, iterations) => {
  var newConfig = Object.assign({}, config)
  if (!newConfig.compare) {
    newConfig.compare = (x, y) => {
      return y - x
    }
  }
  if (newConfig.population.length <= 0) {
    throw new Error('Population must be nonempty.')
  }
  if (newConfig.population.length % 2 !== 0) {
    throw new Error('Population length must be an even number.')
  }
  if (!newConfig.mutation) {
    throw new Error('Mutation function required.')
  }
  if (!newConfig.selection) {
    throw new Error('Selection function required.')
  }
  if (!newConfig.crossover) {
    throw new Error('Crossover function required.')
  }

  return runHelper(newConfig)
}

runHelper = config => {
  // Evaluate the fitness of each individual in sequence.
  var fitnessPromise = Promise.resolve([])
  config.population.forEach(individual => {
    fitnessPromise = fitnessPromise.then(fitnesses => {
      return Promise.resolve(config.fitness(individual)).then(fitness => {
        fitnesses = fitnesses.concat(fitness)
        return fitnesses
      })
    })
  })

  var futureRun = (resolve, reject) => {
    fitnessPromise.then(fitnesses => {
      // Most fit individual comes first.
      var popWithFitnesses = zip(config.population, fitnesses)
        .sort((x, y) => config.compare(x.fitness, y.fitness))
      var popBest = popWithFitnesses[0]
      var nextConfig = Object.assign({}, config)

      // Update best individual so far
      if (!config.best || config.best.fitness < popBest.fitness) {
        nextConfig.best = popBest
      }

      // Call stats callback
      if (config.stats) {
        config.stats(fitnesses, nextConfig.best.individual)
      }

      // Terminate if we've run out of iterations or achieved 100% fit solution
      if (config.iterations <= 0 || config.stop(nextConfig.best.fitness)) {
        resolve(nextConfig)
        return
      }

      // Generate next population by selecting, crossing over, and mutating.
      var nextPop = selectNextPop(popWithFitnesses, config.selection)
      nextPop = applyCrossover(nextPop, config.crossover)
      nextPop = nextPop.map(config.mutation)

      // If we're being elitist, copy over most fit individual unchanged to
      // next population.
      if (config.elitist) {
        nextPop[0] = popBest.individual
      }

      // Recurse
      nextConfig.population = nextPop
      nextConfig.iterations -= 1
      resolve(module.exports.run(nextConfig))
    }).catch(err => reject(err))
  }

  return new Promise(futureRun)
}

zip = (population, fitnesses) => {
  return population.map((x, idx) => {
    return { individual: x, fitness: fitnesses[idx] }
  })
}

selectNextPop = (population, selection) => {
  var nextPop = []
  for (var i = 0; i < population.length; i++) {
    nextPop.push(selection(population))
  }
  return nextPop
}

applyCrossover = (population, crossover) => {
  var newPopulation = []
  for (var i = 0; i < population.length; i += 2) {
    newPopulation = newPopulation.concat(crossover(population[i], population[i + 1]))
  }
  return newPopulation
}
