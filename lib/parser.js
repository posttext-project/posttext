const DocumentCursor = require('./cursor/document-cursor');

module.exports = class Parser {
	parse(document, options) {
		let cursor = new DocumentCursor(cursor);

		return ast;
	}

	indent(cursor) {
		let size = 0;

		do {
			while (
				cursor.eql('\t')
				|| cursor.eql('  ')
			) {
				++size;

				if (cursor.eql('\t')) {
					cursor.next(1);
				} else {
					cursor.next(2)
				}
			}

			if (cursor.eql(' ')) {
				cursor.next(1);
			}

			if ( 
				cursor.eql('\n')
				|| cursor.eql('\r')
			) {
				size = 0;
				cursor.next(1);
			}
		} while (
			cursor.eql('\t')
			|| cursor.eql(' ')
		);

		return size;
	}

	blocks(cursor) {
		let indent = this.indent(cursor),
			blocks = [];

		while (!cursor.eof()) {
			let blockName = this.blockName(cursor),
				properties = this.properties(cursor),
				nextIndent = this.indent(cursor),
				content = this.content(cursor);
	
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

	blockName(cursor) {
		let blockName = "";

		while (
			!cursor.eql('[')
			&& !cursor.eql(']')
			&& !cursor.eql(' ')
			&& !cursor.eof()
		) {
			if (cursor.eql('\\')) {
				cursor.next(2);
				blockName += cursor.consume(1);
			}
			else {
				cursor.next(1);
				blockName += cursor.consume(1);
			}
		}

		return blockName;
	}

	attributes(cursor) {
		let attributes = [];

		while (cursor.eql(' ')) {
			cursor.next(1);
		}

		if (!cursor.eql('[')) {
			return attributes;
		}

		while (
			!cursor.eql(']')
			&& !cursor.eof()
		) {
			let attributeName = this.attributeName(cursor);

			if (
				cursor.eql(']')
				|| cursor.eof()
			) {
				attributes.push([attributeName]);
			}
			else if (cursor.eql(';')) {
				attributes.push([attributeName, undefined]);
				cursor.next(1);
			}
			else if (cursor.eql('=')) {
				cursor.next(1);

				let attributeValue = this.attributeValue(cursor);
				attributes.push([attributeName, attributeValue]);

				cursor.next(1);
			}
			else {
				return "error";
			}
		}

		if (cursor.eql(']')) {
			cursor.next(1);
		}

		return attributes;
	}

	attributeName(cursor) {
		let attributeName = "";

		while (
			!cursor.eql(']')
			&& !cursor.eql('=')
			&& !cursor.eql(';')
			&& !cursor.eof()
		) {
			if (
				cursor.eql('\\')
			) {
				cursor.next(2);
				attributeName += cursor.consume(1);
			}
			else {
				cursor.next(1);
				attributeName += cursor.consume(1);
			}
		}

		return attributeName;
	}

	attributeValue(cursor) {
		let attributeValue = "";

		while (
			!cursor.eql(']')
			&& !cursor.eql(';')
			&& !cursor.eof()
		) {
			if (
				cursor.eql('\\')
			) {
				cursor.next(2);
				attributeValue += cursor.consume(1);
			}
			else {
				cursor.next(1);
				attributeValue += cursor.consume(1);
			}
		}

		return attributeValue;
	}

	content(cursor, blockName, attributes) {
		return this.parseBlock(blockName)(cursor, attributes);
	}

	register(blockName, parse) {
		this._blockParsers[blockName] = parse;
	}

	parseBlock(blockName) {
		let parse = this._blockParsers[blockName];

		if (parse) {
			return parse;
		}
		else {
			return content => content;
		}
	}

	richText(cursor) {
		while (
			cursor.eql(' ')
			|| cursor.eql('\t')
			|| cursor.eql('\r')
			|| cursor.eql('\n')
		) {
			cursor.next(1);
		}

		let lines = [],
			textNodes = [];

		let emptyLines = -1;
		
		while (!cursor.eof()) {
			let count = 0;

			while (
				!cursor.eql('\r')
				&& !cursor.eql('\n')
				&& !cursor.eof()
			) {
				if (!cursor.eql('&')) {
					cursor.next(1);
					++count;
				}
				else {
					if (count > 0) {
						textNodes.push(cursor.consume(count));
					}
					textNodes.push(this.inline(cursor));
					count = 0;
				}
			}

			if (count > 0) {
				textNodes.push(cursor.consume(count));
			}

			while (
				cursor.eql(' ')
				|| cursor.eql('\t')
				|| cursor.eql('\r')
				|| cursor.eql('\n')
			) {
				if (cursor.eql('\r\n') || cursor.eql('\r\n')) {
					++emptyLines;
					cursor.next(2);
				} else if (cursor.eql('\n') || cursor.eql('\r')) {
					++emptyLines;
					cursor.next(1);
				} else {
					cursor.next(1);
				}
			}

			if (emptyLines > 0) {
				lines.push(textNodes);
				textNodes = [];
			}
			emptyLines = -1;
		}

		if (textNodes.length > 0) {
			lines.push(textNodes);
		}

		return lines;
	}

	inline(cursor) {
		
	}

	data(cursor) {
		let data = {};

		while (!cursor.eof()) {
			let propertyName, propertyValue;

			while (!cursor.eql(':') || !cursor.eql(';')) {
				cursor.next(1);
			}

			if (cursor.eql(':')) {
				while (!cursor.eql(';')) {
					if (
						cursor.eql('\\;')
						|| cursor.eql('\\:')
					) {
						cursor.next(2);
					}
					else {
						cursor.next(1);
					}
				}
			}
		}

		return new Data(data);
	}
}