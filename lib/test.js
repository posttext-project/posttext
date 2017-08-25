const DocumentCursor = require('./cursor/document-cursor');
const Parser = require('./parser');

let cursor;

cursor = new DocumentCursor(`   
			 
			indent [
				style = vintage;
				width\\] = 100;
				font-family = Arial, Consolas;
			]

			
				what the hell are you thinking?
				how do you do!
				
				what is this thing?
				
				`);
		
let parser = new Parser();

console.log(parser.indent(cursor));
console.log(parser.blockName(cursor));
console.log(parser.attributes(cursor));