const parser = Base => class Parser extends Base {
	constructor() {
		super();

		this._terminals = [];
		this._nonterminals = [];
		this._rules = [];
		this._cursor = 0;
		this._table = [{}];
		this._stack = [];
		this._state = 0;
	}

	set rules(rules) {
		this._rules = rules;
	}

	get rules() {
		return this._rules;
	}

	addRule(str) {
		let rule =
			str
				.split(' ')
				.filter(sym =>
					sym !== '->'
					&& sym !== '+'
					&& sym !== '');

		this._rules.push(rule);
	}

	get cursor() {
		return this._cursor;
	}

	createTable() {
		this._nonterminals =
			new Set(
				this
					._rules
					.map(rule => rule[0])
			);

		const symbols =
			new Set(
				this
					._rules
					.reduce((accu, rule) =>
						accu.concat(rule), [])
			);

		this._terminals = new Set(symbols);

		for (let symbol of this._nonterminals) {
			this._terminals.delete(symbol);
		}

		let methods = [];

		for (let symbol of this._terminals.keys()) {
			if (!this[`$${symbol}`]) {
				methods.push(`$${symbol}`);
			}
		}

		this.addMethods(methods);

		methods = [];

		for (let symbol of this._terminals.keys()) {
			if (!this[`$${symbol}`]) {
				methods.push(`$${symbol}`);
			}
		}

		if (methods.length > 0) {
			console.log(`[${methods}] are missing in parser prototype.`);
		}

		let cursor = 1,
			nextItemset = 1,
			lastActive = new Set(this._rules.map(rule => [rule, 0])),
			currentActive = new Set();

		while (lastActive.size > 0) {
			for (let symbol of this._terminals.keys()) {
				let hasReduce = false;

				for (let [rule, itemset] of lastActive.keys()) {
					if (rule[cursor] === symbol) {
						this._table[itemset][symbol] = ['shift', nextItemset];

						if (cursor + 1 === rule.length) {
							hasReduce = true;
						}
						else {
							currentActive.add([rule, nextItemset]);
						}
					}
				}

				++nextItemset;
				this._table.push({});
			}

			for (let symbol of this._nonterminals.keys()) {
				for (let rule of lastActive.keys()) {
					if (rule[cursor] === symbol) {
						this._table[itemset][symbol] = ['goto', nextItemset];

						if (cursor + 1 === rule.length) {
							this._table[itemset][symbol] = ['reduce', rule];
						}
						else {
							currentActive.add([rule, nextItemset]);
						}
					}
				}

				++nextItemset;
				this._table.push({});
			}

			lastActive = currentActive;
			currentActive = new Set();
			++cursor;
		}

		Object.defineProperty(this, 'parse', {
			value() {
				
			},
			configurable: true
		});
	}

	addMethods(methods) {	}

	parse(code) {

	}

	shift(state, symbol) {
		this.state = state;
		return this[symbol]();
	}

	reduce(rule) {

	}
}

module.exports = parser;