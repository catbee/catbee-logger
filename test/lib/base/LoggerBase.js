const Lab = require('lab');
const lab = exports.lab = Lab.script();
const { experiment, test, beforeEach } = lab;

const assert = require('assert');

const LoggerBase = require('../../../lib/base/LoggerBase');

experiment('lib/base/LoggerBase', () => {
  experiment('#_enrichments', () => {
    test('should be an array', (done) => {
      const logger = new LoggerBase();

      assert(Array.isArray(logger._enrichments));

      done();
    });

    test('should be empty array by default', (done) => {
      const logger = new LoggerBase();

      assert.deepEqual([], logger._enrichments);

      done();
    });
  });

  experiment('#addEnrichment', () => {
    test('should add enrichment function to _enrichments array', (done) => {
      const logger = new LoggerBase();

      const another = () => {};

      function enrichment () {}

      logger.addEnrichment(enrichment);
      logger.addEnrichment(another);

      assert.deepEqual([enrichment, another], logger._enrichments);

      done();
    });

    test('should throw TypeError if enrichment is not a function', (done) => {
      const logger = new LoggerBase();

      assert.throws(() => {
        logger.addEnrichment('');
      }, TypeError);

      done();
    });
  });

  experiment('#dropEnrichments', () => {
    test('should clean up all current enrichments', (done) => {
      const logger = new LoggerBase();

      const another = () => {};

      function enrichment () {}

      logger.addEnrichment(enrichment);
      logger.addEnrichment(another);

      logger.dropEnrichments();

      assert.deepEqual([], logger._enrichments);

      done();
    });
  });

  experiment('#removeEnrichment', () => {
    test('should delete one enrichment by link on it', (done) => {
      const logger = new LoggerBase();

      const another = () => {};

      function enrichment () {}

      function enrich () {}

      logger.addEnrichment(enrichment);
      logger.addEnrichment(another);
      logger.addEnrichment(enrich);

      logger.removeEnrichment(another);

      assert.deepEqual([enrichment, enrich], logger._enrichments);

      done();
    });
  });

  experiment('#_enrichLog', () => {
    test('should enrich log', (done) => {
      const logger = new LoggerBase();

      const expected = {
        data: 'some data'
      };

      logger.addEnrichment((log) => {
        log.data = expected.data;
      });

      const log = {};

      logger._enrichLog(log);

      assert.deepEqual(expected, log);

      done();
    });
  });

  experiment('#_setLevels', () => {
    let logger = null;

    beforeEach((done) => {
      logger = new LoggerBase();
      done();
    });

    test('should do nothing if no string/object in param', (done) => {
      const defaultLevels = logger._levels;

      logger._setLevels();

      assert.deepEqual(defaultLevels, logger._levels);

      done();
    });

    test('should parse levels in string', (done) => {
      const levels = 'error,warn,fatal';

      const expectedLevels = {
        warn: true,
        error: true,
        fatal: true
      };

      logger._setLevels(levels);

      assert.deepEqual(expectedLevels, logger._levels);

      done();
    });

    test('should use object levels as is', (done) => {
      const levels = {
        fatal: true,
        error: true
      };

      logger._setLevels(levels);

      assert.deepEqual(levels, logger._levels);

      done();
    });
  });

  experiment('#_errorFormatter', () => {
    let logger = null;

    beforeEach((done) => {
      logger = new LoggerBase();
      done();
    });

    test('should parse Error object', (done) => {
      const error = new Error('error message');

      const expected = {
        message: `${error.name}: ${error.message}`,
        fields: {
          stack: error.stack
        }
      };

      const result = logger._errorFormatter(error);

      assert.deepEqual(expected, result);

      done();
    });

    test('should parse extract stack and message fields if error is object', (done) => {
      const error = {
        message: 'Error message',
        stack: 'some stackTrace'
      };

      const expected = {
        message: error.message,
        fields: {
          stack: error.stack
        }
      };

      const result = logger._errorFormatter(error);

      assert.deepEqual(expected, result);

      done();
    });

    test('should generate stackTrace if no stack in error object', (done) => {
      const error = {
        message: 'Error message'
      };

      const { fields: { stack } } = logger._errorFormatter(error);

      assert(stack);

      done();
    });

    test('should generate stackTrace if error is string', (done) => {
      const error = 'Error message';

      const { message, fields: { stack } } = logger._errorFormatter(error);

      assert.equal(message, error);
      assert(stack);

      done();
    });
  });

  experiment('#_send', () => {
    test('should throw error if .log method is not realized in inheritor', (done) => {
      const logger = new LoggerBase();

      assert.throws(() => logger._send(), ReferenceError);

      done();
    });
  });
});
