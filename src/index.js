const Logger = require('./lib/Logger');

module.exports = {
  /**
   * @param {ServiceLocator} locator
   * @param {Function} locator.register
   */
  register (locator, formatter) {
    const config = locator.resolve('config');
    const logger = new Logger(locator, formatter);

    locator.registerInstance('logger', logger);

    const bus = locator.resolve('eventBus');

    bus.on('error', (error) => logger.error(error));
  }
};
