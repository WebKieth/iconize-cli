const { toPascalCase } = require('../utils')

module.exports = (element) => {
	const id = element.attr('id')
	const iconName = toPascalCase(id)
	const path = element
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