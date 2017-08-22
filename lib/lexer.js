module.exports = class Lexer {
	constructor() {
		super();
	}

	data(cursor) {
		let data = {};

		while (!cursor.eof()) {
			let propertyName, propertyValue;
			
			while (!cursor.eql(':') || !cursor.eql(';')) {
				cursor.move(1);
			}

			if (cursor.eql(':')) {
				while (!cursor.eql(';')) {
					if (
						cursor.eql('\\;')
						|| cursor.eql('\\:')
					) {
						cursor.move(2);
					}
					else {
						cursor.move(1);
					}
				}
			}
		}

		return new Data(data);
	}

	blocks(cursor) {
		let indent = this.indent(cursor),
			blocks = [];

		while (!cursor.eof()) {
			let blockName = this.blockName(cursor);
			let properties = this.properties(cursor);
	
			let nextIndent = this.indent(cursor);
	
			if (nextIndent.size > indent.size) {
				this.startLine(cursor);
				let content = this.content(cursor);
				blocks.push(new Block(blockName, properties, content));
			}
			else {
				indent = nextIndent;
			}
		}

		return blocks;
	}

	indent(cursor, options) {
		let count = 0;

		do {
			while (cursor.eql('\t') || cursor.eql('  ')) {
				if (cursor.eql('\t')) {
					cursor.next(1);
				}
				else {
					cursor.next(2)
				}
			}

			if (cursor.eql('\n')) {
				count = 0;
			}
		} while (cursor.eql('\n'));

		return new Indent(count);
	}

	blockName(cursor) {
		let count = 0;

		while (
			!cursor.eql('[')
			&& !cursor.eql(']')
			&& !cursor.eql(' ')
		) {
			if (
				cursor.eql('\\[')
				|| cursor.eql('\\]')
			) {
				count += cursor.move(2);
			}
			else {
				count += cursor.move(1);
			}
		}

		if (count === 0) {
			// return new Error();
			return;
		}

		let code = cursor.consume(count, true);

		return new BlockIdentity(code);
	}

	properties(cursor) {
		let list = [];

		while (cursor.eql(' ')) {
			cursor.next(1);
		}

		while (!cursor.eql(']')) {

			let propertyName = this.propertyName(cursor);

			if (
				cursor.eql(';')
				|| cursor.eql(']')
			) {
				list.push(new Property(propertyName));
			}
			else if (
				cursor.eql('=')
			) {
				let propertyValue = this.propertyValue

				list.push(new Property(propertyName, propertyValue));
			}
			else {
				// list.push(new Error())
			}
		}

		return list;
	}

	propertyName(cursor) {
		let count = 0;

		while (
			!cursor.eql(']')
			&& !cursor.eql('=')
			&& !cursor.eql(';')
		) {
			if (
				cursor.eql('\\[')
				|| cursor.eql('\\]')
				|| cursor.eql('\\;')
				|| cursor.eql('\\=')
			) {
				count += cursor.move(2);
			}
			else {
				count += cursor.move(1);
			}
		}

		let code = cursor.consume(count);

		return new PropertyName(code);
	}

	propertyValue(cursor) {
		let count = 0;

		while (
			!cursor.eql(']')
			&& !cursor.eql(';')
		) {
			if (
				cursor.eql('\\]')
				|| cursor.eql('\\[')
				|| cursor.eql('\\\\')
				|| cursor.eql('\\;')
			) {
				count += cursor.move(2);
			}
			else {
				count += cursor.move(1);
			}
		}

		let code = cursor.consume(count);

		return new PropertyValue(code);
	}
}