const Void = require('./void');
const hanoi = require('./hanoi');
const lexer = require('./lexer');
const parser = require('./parser');
const compose = require('./stuff/compose')

const Compiler = compose([
	hanoi,
	lexer,
	parser
])(Void);

module.exports = Compiler;