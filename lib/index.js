const axios = require('axios')
const cheerio = require('cheerio')
const { Spinner } = require('clui');
const { readFile, writeFile, mkdir, opendir } = require('node:fs/promises');
const { resolve } = require('node:path');

const createVueJsxContents = require('./templates/vue-jsx')
const createVueContents = require('./templates/vue')
const createReactContents = require('./templates/react');
const { toSnakeCase, toCamelCase, toPascalCase, strListToArr } = require('./utils');

const shouldGenerate = (name, whitelist, blacklist) => {
    if (!whitelist.length && !blacklist.length) return true
    if (whitelist.length) {
        let status = false
        whitelist.forEach((includeRule) => {
            const rule = includeRule
                .split('')
                .filter((letter) => letter !== '*')
                .join('')
            if (includeRule.endsWith('*') && includeRule.startsWith('*')) {
                if (name.includes(rule)) status = true
            } else if (includeRule.endsWith('*')) {
                if (name.startsWith(rule)) status = true
            } else if (includeRule.startsWith('*')) {
                if (name.endsWith(rule)) status = true
            }
        })
        return status
    } else if (blacklist.length) {
        let status = true
        blacklist.forEach((excludeRule) => {
            const rule = excludeRule
                .split('')
                .filter((letter) => letter !== '*')
                .join('')
            if (excludeRule.endsWith('*') && excludeRule.startsWith('*')) {
                if (name.includes(rule)) status = false
            } else if (excludeRule.endsWith('*')) {
                if (name.startsWith(rule)) status = false
            } else if (excludeRule.startsWith('*')) {
                if (name.endsWith(rule)) status = false
            }
        })
        return status
    }
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
                const file = await readFile(resolve(source), {encoding: 'utf8'})
                vectorMarkupString = file
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