module.exports = (element) => {
	const id = element.attr('id')
	const path = element
		.html()
		.replaceAll('    <g', '		<g')
		.replaceAll('    </g>', '		</g>')
		.replaceAll('        <path','			<path')
		.replaceAll(' d', '\n				d')
		.replaceAll(' stroke', '\n				stroke')
		.replaceAll('></', '\n			></')
		.replaceAll('><path', '>\n			<path')

	return `<script>
import { defineComponent } from 'vue'
export default defineComponent({
	props: {
		width: {
			type: Number,
			default: 24
		},
		height: {
			type: Number,
			default: 24
		}
	}
})
</script>
<template>
	<svg
		id="${id}"
		fill="currentColor"
		viewBox="0 0 24 24"
		:width="width"
		:height="height"
	>
	${path}	</svg>
</template>
`
}