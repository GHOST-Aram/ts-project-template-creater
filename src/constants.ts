import fs from 'fs'
import path from 'path'

export const CURRENT_DIR = process.cwd()
export const SKIP_FILES = ['node_modules', '.template.json']
const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'))
export const QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: 'What project would you like to generate?',
        choices: CHOICES,
    },{
        name: 'name',
        type: 'input',
        message: 'Project name:',
    }
]
