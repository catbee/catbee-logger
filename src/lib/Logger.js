const winston = require('winston');
const LoggerBase = require('./base/LoggerBase');

/**
 * Creates server logger.
 *
 * @param {ServiceLocator} $serviceLocator
 * @class
 */
class Logger extends LoggerBase {
  constructor (locator, formatter) {
    super();

    this._config = locator.resolve('config');
    this._formatter = formatter;
    this._config.logger = this._config.logger || {};

    this._setLevels(this._config.logger.levels);

    this.addEnrichment((log) => {
      log.from = 'Server';
    });

    this._logger = new winston.Logger({
      level: 'trace',
      levels: { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5 }
    });

    /**
     * Native winston interface for add/remove transports.
     */
    this.addTransport = this._logger.add.bind(this._logger);
    this.removeTransport = this._logger.remove.bind(this._logger);

    /**
     * Entry point for server logs.
     * Executes from LoggerBase.
     */
    this.log = this._logger.log.bind(this._logger);

    this._initConsoleLogger(this._config.logger.console);
  }

  dropTransports () {
    Object
      .keys(this._logger.transports)
      .forEach((transport) => this.removeTransport(transport));
  }

  /**
   * Init console transport logger
   *
   * @param {Object} userConfig
   * @private
   */
  _initConsoleLogger (userConfig = {}) {
    let config = userConfig;

    let formatter = this._formatter;

    if (formatter) {
      config = formatter.config(userConfig, {
        colors: {
          trace: 'blue',
          debug: 'cyan',
          info: 'green',
          warn: 'yellow',
          error: 'red',
          fatal: 'magenta'
        }
      });
    }

    this.addTransport(winston.transports.Console, config);
  }

  /**
   * Logs debug message.
   *
   * @param {string} message
   * @param {Object|undefined} meta
   */
  debug (message, meta = {}) {
    if (!this._levels.debug) {
      return;
    }

    this._message('debug', message, meta);
  }

  /**
   * Logs trace message.
   *
   * @param {string} message
   * @param {Object|undefined} meta
   */
  trace (message, meta = {}) {
    if (!this._levels.trace) {
      return;
    }

    this._message('trace', message, meta);
  }

  /**
   * Logs info message.
   *
   * @param {string} message
   * @param {Object|undefined} meta
   */
  info (message, meta = {}) {
    if (!this._levels.info) {
      return;
    }

    this._message('info', message, meta);
  }

  /**
   * Logs warn message.
   *
   * @param {string} message
   * @param {Object|undefined} meta
   */
  warn (message, meta = {}) {
    if (!this._levels.warn) {
      return;
    }

    this._message('warn', message, meta);
  }

  /**
   * Logs error message.
   *
   * @param {string|Error} message
   * @param {Object|undefined} meta
   */
  error (message, meta = {}) {
    if (!this._levels.error) {
      return;
    }

    this._error('error', message, meta);
  }

  /**
   * Logs fatal message.
   *
   * @param {string|Error} message
   * @param {Object|undefined} meta
   */
  fatal (message, meta = {}) {
    if (!this._levels.fatal) {
      return;
    }

    this._error('fatal', message, meta);
  }
}

module.exports = Logger;
