const lexer = Base => class Lexer extends Base {
	constructor() {
		super();

		this.beforeCreateTable();
		this.createTable();

		console.log(this._table);
	}

	beforeCreateTable() {
		this.addRule('blocks -> blocks + block');
		this.addRule('block -> none');
		this.addRule('block -> identity + openBracket + properties + closeBracket + content');
		this.addRule('properties -> properties + property');
		this.addRule('property -> propertyName + assign + propertyValue');
	}

	$identity() {

	}

	$none() {

	}

	$openBracket() {

	}

	$closeBracket() {

	}

	$content() {

	}

	$propertyName() {

	}

	$assign() {

	}

	$propertyValue() {

	}
}

module.exports = lexer;