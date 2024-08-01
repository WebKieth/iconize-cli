module.exports = (element) => {
	const id = element.attr('id')
	const path = element
		.html()
		.replaceAll('<g', '			<g')
		.replaceAll('</g>', '			</g>')
		.replaceAll('        <path','					<path')
		.replaceAll(' d', '\n						d')
		.replaceAll(' stroke', '\n					stroke')
		.replaceAll('></', '\n					></')
		.replaceAll('><path', '>\n					<path')

		return `import { defineComponent } from 'vue'

export const iconComponentProps = {
	width: {
		type: Number,
		default: 24
	},
	height: {
		type: Number,
		default: 24
	},
}

export default defineComponent({
	props: iconComponentProps,
	setup(props) {
		return () => (
			<svg
				id="${id}"
				fill="currentColor"
				viewBox="0 0 24 24"
				width={props.width}
				height={props.height}
			>${path}			</svg>
		)
	},
})
`
}