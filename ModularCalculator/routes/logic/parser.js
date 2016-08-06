function Parser(modules, inp) {
  this.modules = modules;
  this.inp = inp;

  var max = 10

  this.adjacencyMatrix = new Array(max)
  for (var i = 0; i < max; i++) {
    this.adjacencyMatrix[i] = new Array(max)
    this.adjacencyMatrix[i].fill(0)

  }


  this.nodeDict = [];
  this.count = 0;


  this.run = function() {
      this.parseText();

      var max = this.nodeDict.length

      var culled = new Array(max)
      for (var i = 0; i < max; i++) {
        culled[i] = new Array(max)
        culled[i].fill(0)

      }
      for (var r = 0; r < max; r++) {
        for (var c = 0; c < max; c++) {
          culled[r][c] = this.adjacencyMatrix[r][c]
        }
      }

      e = new Environment([], [Base], culled, this.nodeDict.reverse());
      console.log(e.run())
      return culled;
    }
    //assumption: there is only one top level function at a time
  this.parseText = function(expression) {
    if (expression === undefined) {
      expression = inp;
    }
    if (!isNaN(parseFloat(expression))) {
      var k = parseFloat(expression)
      this.nodeDict.push(() => k)
      return [() => k, this.count++]
    }

    var expressions = this.identifyExpressions(expression);
    var func = this.identifyFunction(expression, expressions);

    this.nodeDict.push(func);
    var parsed = expressions.map(x => this.parseText(x))
    for (var i = 0; i < parsed.length; i++) {
      this.adjacencyMatrix[parsed[i][1]][this.count] = 1;
    }

    return [func, this.count++];
  };

  this.identifyExpressions = function(nakedExpression) {
    var openIndicies = [];
    var closeIndicies = [];

    var expressions = [];

    for (var x = 0; x < nakedExpression.length; x++) {
      var c = nakedExpression.charAt(x);
      if (c === "(") {
        openIndicies.push(x);
      }
      if (c === ")") {
        closeIndicies.push(x);
      }
      if (openIndicies.length == closeIndicies.length && openIndicies.length !== 0) {
        expressions.push(nakedExpression.substring(openIndicies[0] + 1, closeIndicies[closeIndicies.length - 1]));
        openIndicies = [];
        closeIndicies = [];
      }
    }
    return expressions;
  };

  this.identifyFunction = function(nakedExpression, subExpressions) {
    var arity = subExpressions.length;
    var func = nakedExpression;
    for (var i = 0; i < subExpressions.length; i++) {
      func = func.replace("(" + subExpressions[i] + ")", '');
    }
    var syntaxPattern = this.getSyntaxPattern(nakedExpression, subExpressions, func);

    allFunctions = [];
    for (var i = 0; i < this.modules.length; i++) {
      for (var j = 0; j < this.modules[i].functions.length; j++) {
        allFunctions.push(this.modules[i].functions[j]);
      }
    }

    finalFunc = allFunctions.filter(x => x[0].length == arity).filter(x => x[1] == syntaxPattern);
    return finalFunc[0][0];

  };

  this.getSyntaxPattern = function(nakedExpression, subExpressions, func) {
    var expressionLocations = subExpressions.map(x => nakedExpression.indexOf(x));
    var functionLocation = nakedExpression.indexOf(func);
    var relativeLocations = expressionLocations.map(x => x > functionLocation);
    relativeLocations.sort();
    var syntaxPattern = "";

    relativeLocations.filter(x => x === false).map(() => syntaxPattern += "_,");
    syntaxPattern = syntaxPattern.substring(0, syntaxPattern.length - 1);
    syntaxPattern += func;
    relativeLocations.filter(x => x === true).map(() => syntaxPattern += "_,");
    syntaxPattern = syntaxPattern.substring(0, syntaxPattern.length - 1);
    syntaxPattern = syntaxPattern.split(" ").join("");
    return syntaxPattern;

  };

  this.bind = function(node, dependent) {
    this.adjacencyMatrix[node][dependent] = 1;
  };

}