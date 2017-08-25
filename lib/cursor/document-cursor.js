module.exports = class DocumentCursor {
	constructor(arg) {
		if (arg instanceof DocumentCursor) {
			let cursor = arg;

			this._pointer = cursor._pointer;
			this._column = cursor._column;
			this._line = cursor._line;
			this._document = cursor._document;
			this._eof = cursor._eof;

			if (cursor._state instanceof Object) {
				this._state = Object.assign({}, this._state);
			}
			else {
				this._state = cursor._state;
			}
		}
		else {
			let _document = arg;

			this._pointer = 0;
			this._column = 0;
			this._line = 0;
			this._document = _document;
			this._eof = _document.length;
			this._state = undefined;
		}
	}

	get state() {
		return this._state;
	}

	set state(newState) {
		return this._state = newState;
	}

	setState(updater) {
		return this._state = updater(this._state);
	}

	eql(symbol) {
		for (
			let i = 0, len = symbol.length;
			i < len;
			++i
		) {
			let pos = this._pointer + i;

			if (
				symbol[i] !== this._document[pos]
				|| pos >= this._eof
			) {
				return false;
			}
		}

		return true;
	}

	next(offset) {
		this._pointer += offset;
	}

	consume(offset, moveCursor) {
		if (offset < 0) {
			return this._document.substr(
				this._pointer,
				-offset
			);
		}

		return this._document.substr(
			this._pointer - offset,
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