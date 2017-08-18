const Void = require('./void');
const lexer = require('./lexer');
const parser = require('./parser');
const compose = require('./stuff/compose');

const Compiler = compose([
	lexer,
	parser
])(Void);

module.exports = Compiler;