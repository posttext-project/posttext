module.exports = class DocumentCursor {
	constructor(document) {
		super();
		this._pointer = 0;
		this._column = 0;
		this._line = 0;
		this._document = document;
		this._eof = document.length;
	}

	eql(symbol) {
		for (
			let i = 0, len = symbol.length;
			i < len;
			++i
		) {
			if (symbol[i] !== this._document[this._pointer + i]) {
				return false;
			}
		}

		return true;
	}

	move(offset) {
		this._pointer += offset;
	}

	consume(offset, moveCursor) {
		if (offset < 0) {
			if (moveCursor) {
				this._pointer -= offset;

				return this._document.substr(
					this._pointer,
					offset
				);
			}

			return this._document.substr(
				this._pointer - offset,
				offset
			);
		}

		if (moveCursor) {
			this._pointer += offset;

			return this._document.substr(
				this._pointer - offset,
				offset
			);
		}

		return this._document.substr(
			this._pointer,
			offset
		);
	}

	setEof(cursor) {
		this._eof = cursor._pointer;
	}

	resetEof(cursor) {
		this._eof = this._document.length;
	}

	eof() {
		return this._pointer >= this._eof;
	}
}