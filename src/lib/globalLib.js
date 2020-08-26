const RuntimeError = require("../errors.js").RuntimeError;
const EguaFunction = require("../structures/function.js");
const EguaInstance = require("../structures/instance.js");
const StandardFn = require("../structures/standardFn.js");
const EguaClass = require("../structures/class.js");

/**
 * 
 */
module.exports = function (globals) {
  globals.defineVar(
    "tamanho",
    new StandardFn(1, function (obj) {
      // 
      if (!isNaN(obj)) {
        throw new RuntimeError(
          this.token,
          "Não é possível encontrar o tamanho de um número."
        );
      }

      // 
      if (obj instanceof EguaInstance) {
        throw new RuntimeError(
          this.token,
          "Você não pode encontrar o tamanho de uma declaração."
        );
      }

      if (obj instanceof EguaFunction) {
        return obj.declaration.params.length;
      }

      if (obj instanceof StandardFn) {
        return obj.arityValue;
      }

      if (obj instanceof EguaClass) {
        let methods = obj.methods;
        let length = 0;

        if (methods.init && methods.init.isInitializer) {
          length = methods.init.declaration.params.length;
        }

        return length;
      }

      return obj.length;
    })
  );

  globals.defineVar(
    "texto",
    new StandardFn(1, function (value) {
      return `${value}`;
    })
  );

  globals.defineVar(
    "trenheira",
    new StandardFn(1, function(value) {
      return Array(...arguments);
    })
  );

  globals.defineVar(
    "real",
    new StandardFn(1, function (value) {
      if (!/^-{0,1}\d+$/.test(value) && !/^\d+\.\d+$/.test(value))
        throw new RuntimeError(
          this.token,
          "Somente números podem passar para real."
        );
      return parseFloat(value);
    })
  );

  globals.defineVar(
    "inteiro",
    new StandardFn(1, function (value) {
      if (value === undefined || value === null) {
        throw new RuntimeError(
          this.token,
          "Somente números podem passar para inteiro."
        );
      }

      if (!/^-{0,1}\d+$/.test(value) && !/^\d+\.\d+$/.test(value)) {
        throw new RuntimeError(
          this.token,
          "Somente números podem passar para inteiro."
        );
      }

      return parseInt(value);
    })
  );

  globals.defineVar("exports", {});

  Boolean.prototype.toString = function() {
    return this == true ? 'divera' : 'mintira';
  }

  return globals;
};