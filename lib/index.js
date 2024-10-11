const axios = require('axios')
const cheerio = require('cheerio')
const { Spinner } = require('clui');
const { readFile, writeFile, mkdir, opendir, readdir } = require('node:fs/promises');
const { resolve } = require('node:path');

const createVueJsxContents = require('./templates/vue-jsx')
const createVueContents = require('./templates/vue')
const createReactContents = require('./templates/react');
const { toSnakeCase, toCamelCase, toPascalCase, strListToArr } = require('./utils');

const shouldGenerate = (name, whitelist, blacklist) => {
    if (!whitelist.length && !blacklist.length) return true
    const hasNameInRules = (list, name) => (
        list.some((rule) => {
            const target = rule
                .split('')
                .filter((letter) => letter !== '*')
                .join('')
            if (rule.endsWith('*') && rule.startsWith('*')) {
                if (name.includes(target)) return true
            } else if (rule.endsWith('*')) {
                if (name.startsWith(target)) return true
            } else if (rule.startsWith('*')) {
                if (name.endsWith(target)) return true
            }
            return false
        })
    )
    if (whitelist.length) return hasNameInRules(whitelist, name)
    else if (blacklist.length) return !hasNameInRules(blacklist, name)
}

const isSourceFolder = async (source) => {
    let isFolder = false
    try {
        await readFile(resolve(source), {encoding: 'utf8'})
    } catch (err) {
        if (err.code === 'EISDIR') isFolder = true
    }
    return isFolder
}

module.exports = {
    generate:  async ({
        source = './icons.svg',
        output = './__generated',
        lib = 'vue',
        filenameCase = 'kebab-case',
        debug = false,
        whitelist = '',
        blacklist = ''
    }) => {
        let vectorMarkupString = ''
        const isUrl = source.startsWith('http')
        if (isUrl) {
            try {
                const response = await axios(source)
                if (debug) console.log('[DEBUG: loading from url]')
                vectorMarkupString = response.data
            } catch (error) {
                if (debug) console.log('DEBUG: An error occured]')
                throw error
            }
        } else {
            try {
                const isFolder = await isSourceFolder(source)
                if (isFolder) {
                    vectorMarkupString = `<body>`
                    const fileNames = await readdir(resolve(source))
                    for (let i = 0; i < fileNames.length; i++) {
                        const fileName = fileNames[i]
                        const content = await readFile(resolve(source, fileName), {encoding: 'utf8'})
                        const $ = cheerio.load(content)
                        const updatedContent = $('svg')
                            .prop('id', fileName.replace(/\.[^/.]+$/, ""))
                            .prop('outerHTML')
                        vectorMarkupString = `${vectorMarkupString}${updatedContent}`
                    }
                    vectorMarkupString = `${vectorMarkupString}</body>`
                } else {
                    const file = await readFile(resolve(source), {encoding: 'utf8'})
                    vectorMarkupString = file
                }
                if (debug) console.log('[DEBUG: Red from file]')
            } catch (error) {
                if (debug) console.log('DEBUG: An error occured]')
                throw error
            }
        }
        if (debug) console.log(`
    [DEBUG: first 64 symbols which saved in memory]
    ${vectorMarkupString.substring(0, 64)}...
    `)
        const $ = cheerio.load(vectorMarkupString)
        const symbols = $('symbol')
        const svgs = $('svg')
        const elements =
            svgs.length === 0 || (svgs.length === 1 && !$(svgs[0]).attr('viewBox'))
                ? symbols
                : svgs
    
        const spin = new Spinner('generating icons, please wait...')
        spin.start()

        const whiteListArr = strListToArr(whitelist)
        const blackListArr = strListToArr(blacklist)
    
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index]
            const queriedElement = $(element)

            const iconName = queriedElement.attr('id')

            if (!shouldGenerate(iconName, whiteListArr, blackListArr)) continue

            const extension = lib === 'vue'
                ? 'vue'
                : lib === 'vue-jsx' || lib === 'react'
                    ? 'jsx'
                    : 'js'

            const casedIconName = filenameCase === 'snake_case'
                ? toSnakeCase(iconName)
                : filenameCase === 'camelCase'
                    ? toCamelCase(iconName)
                    : filenameCase === 'PascalCase'
                        ? toPascalCase(iconName)
                        : iconName

            const fileName = `${casedIconName}.${extension}`
    
            if (debug) console.log(`[DEBUG: start templating] ${index} ${fileName}`)
            const contents = lib === 'vue'
                ? createVueContents(queriedElement)
                : lib === 'vue-jsx'
                    ? createVueJsxContents(queriedElement)
                    : createReactContents(queriedElement)
            let dir
            try {
                dir = await opendir(resolve(output))
            } catch (err) {
                await mkdir(resolve(output), {recursive: true})
            }
            finally {
                await dir?.close()
            }
            if (debug) console.log('[DEBUG: end templating] ', resolve(output, fileName))
            await writeFile(`${resolve(output, fileName)}`, contents)
        }
        spin.stop()
        console.log('Iconize: process completed')
    }
}