function compose(funcs) {
	return arg =>
		funcs
			.reverse()
			.reduce((accu, func) => func(accu), arg);
}

module.exports = compose;