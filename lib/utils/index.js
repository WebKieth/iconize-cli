module.exports = {
    toSnakeCase: (s) => (
        s.replace(/-/g, "_")
    ),
    toPascalCase: (s) => (
        (s.charAt(0).toUpperCase() + s.slice(1))
        .replace(/(-|_)./g, (x) => x[1].toUpperCase())
    ),
    toCamelCase: (s) => (
        s.replace(/(-|_)./g, (x) => x[1].toUpperCase())
    ),
    strListToArr: (s) => (
        s
            .split(',')
            .filter((item) => item)
            .map((item) => item.trim())
    )
}