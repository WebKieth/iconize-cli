#!/usr/bin/env node

const inquirer = require('inquirer')
const { generate } = require('../lib')

const prompt = inquirer.createPromptModule()

prompt([
    {
        type: 'input',
        name: 'source',
        message: 'Write the source path for SVG. It can be path or url.',
        default: './icons.svg'
    }, {
        type: 'input',
        name: 'output',
        message: 'Write the directory for output generated icons. If it does not exist, it will be created automatically.',
        default: './__generated'
    }, {
        type: 'list',
        name: 'lib',
        message: 'Choose the library you want to generate for.',
        choices: ['vue', 'vue-jsx', 'react'],
        default: 'vue'
    }, {
        type: 'input',
        name: 'whitelist',
        message: 'White list: Type comma separated icon ids, which you want to generate. If it empty, utility will generate all icons.',
        default: ''
    }, {
        type: 'input',
        name: 'blacklist',
        message: 'Black list: Type comma separated icon ids, which you want to exclude from generating.\n Ignoring if white list was wrote.\n If it empty, utility will generate all icons.',
        default: ''
    }, {
        type: 'list',
        name: 'filenameCase',
        message: 'Choose case type for file names.',
        choices: ['kebab-case', 'camelCase', 'snake_case', 'PascalCase']
    }, {
        type: 'confirm',
        name: 'debug',
        message: 'Activate debug mode?',
        default: false
    }
]).then((answers) => {
    generate(answers)
})