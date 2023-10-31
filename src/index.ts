#! /usr/bin/env node
import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import { CliOptions } from './interfaces'
import { 
    createDirectoryContents, 
    createProjectDirectory, 
    runPostProcess 
} from './file-system'
import { CURR_DIR } from './file-system'


const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'))
const QUESTIONS = [
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

inquirer.prompt(QUESTIONS).then(answers =>{

    const projectCHoice = answers['template']
    const projectName = answers['name']
    const templatePath = path.join(__dirname, 'templates', projectCHoice)
    const targetPath = path.join(CURR_DIR, projectName)
    const options: CliOptions = {
        projectName,
        templateName: projectCHoice,
        templatePath,
        targetPath
    }

    const isProjectCreated: boolean = createProjectDirectory(
        targetPath
    )
    if(!isProjectCreated)
        return

    createDirectoryContents(templatePath, projectName)
    runPostProcess(options)
})