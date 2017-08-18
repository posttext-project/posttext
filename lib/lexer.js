const lexer = Base => class Lexer extends Base {
	constructor() {
		super();
	}

	indent(cursor) {
		let count = 0;

		while (cursor.eql('\t')) {
			count += cursor.move(1);
		}

		return new Indent(count);
	}

	identity(cursor) {
		let count = 0;

		while (!cursor.eql('[') && !cursor.eql(']')) {
			if (cursor.eql('\\[') || cursor.eql('\\]')) {
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
		let list = []

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