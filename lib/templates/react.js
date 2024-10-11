const { toPascalCase, toCamelCase } = require('../utils')
const cheerio = require('cheerio')
module.exports = (element) => {
	const id = element.attr('id')
	const iconName = toPascalCase(id)
	let modifiedElement = ''
	element.children().each((_, child) => {
		console.log(child.attribs)
		const $ = cheerio.load(child)
		Object.keys(child.attribs).forEach((attrKey) => {
			const value = child.attribs[attrKey]
			$(child).removeAttr(attrKey)
			console.log(attrKey, toCamelCase(attrKey))
			$(child).prop(toCamelCase(attrKey), value)
		})
		const htmlItem = $(child).prop('outerHTML')
		modifiedElement = `${modifiedElement}${htmlItem}`
	})
	console.log(`

========================
	
`)
	console.log(modifiedElement)
	const $ = cheerio.load(`<svg>${modifiedElement}</svg>`)
	const path = $('svg')
		.html()
		.replaceAll('<g', '	<g')
		.replaceAll('</g>', '	</g>')
		.replaceAll('        <path','			<path')
		.replaceAll(' d', '\n				d')
		.replaceAll(' stroke', '\n			stroke')
		.replaceAll('></', '\n			></')
		.replaceAll('><path', '>\n			<path')
	
	return `export const ${iconName}Icon = ({
	width = 24,
	height = 24
}) => (
	<svg
		id="${id}"
		fill="currentColor"
		viewBox="0 0 24 24"
		width={width}
		height={height}
	>
	${path}	</svg>
)`
}