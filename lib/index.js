var zip, selectNextPop, applyCrossover, runHelper, computeStats

// config.population must be an even size
module.exports.run = function (config, iterations) {
  var newConfig = Object.assign({}, config)
  if (!newConfig.compare) {
    newConfig.compare = function (x, y) {
      return y - x
    }
  }
  if (newConfig.population.length <= 0) {
    throw new Error('Population must be nonempty.')
  }
  if (newConfig.population.length % 2 !== 0) {
    throw new Error('Population length must be an even number.')
  }
  return runHelper(newConfig)
}

runHelper = function (config) {
  // Allow the fitness function to return either a fitness value or
  // a future fitness value via a Promise. Promise.resolve() hanfles
  // both scenarios.
  var fitnessPromises = config.population.map((individual) =>
    Promise.resolve(config.fitness(individual)))

  var futureRun = function (resolve, reject) {
    Promise.all(fitnessPromises).then((fitnesses) => {
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
        config.stats(computeStats(fitnesses, nextConfig))
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
    }).catch((err) => reject(err))
  }

  return new Promise(futureRun)
}

zip = function (population, fitnesses) {
  return population.map((x, idx) => {
    return { individual: x, fitness: fitnesses[idx] }
  })
}

selectNextPop = function (population, selection) {
  var nextPop = []
  for (var i = 0; i < population.length; i++) {
    nextPop.push(selection(population))
  }
  return nextPop
}

applyCrossover = function (population, crossover) {
  var newPopulation = []
  for (var i = 0; i < population.length; i += 2) {
    newPopulation = newPopulation.concat(crossover(population[i], population[i + 1]))
  }
  return newPopulation
}

computeStats = (fitnesses, config) => {
  var maxFitness = config.best.fitness
  var meanFitness = fitnesses.reduce((sum, val) => sum + val, 0) / fitnesses.length
  var bestIndividual = config.best.individual
  return { maxFitness, meanFitness, bestIndividual }
}
