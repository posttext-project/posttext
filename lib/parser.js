const DocumentCursor = require('./cursor/document-cursor');

const parser = Base => class Parser extends Base {
	constructor() {
		super();
	}

	parse(document) {
		let cursor = new DocumentCursor(document);

		this.blocks(cursor);
	}
}

module.exports = parser;