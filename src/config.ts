import path from 'path'
import { FileSystemWorker } from './FSWorker'

const fsWorker = new FileSystemWorker()

export const CURRENT_DIR = process.cwd()
export const SKIP_FILES = ['node_modules', '.template.json']
export const QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: 'What project would you like to generate?',
        choices: fsWorker.getTemplateFilesNames(
            path.join(__dirname, 'templates')
        ),
    },{
        name: 'name',
        type: 'input',
        message: 'Project name:',
    }
]