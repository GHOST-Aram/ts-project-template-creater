#! /usr/bin/env node
import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import { CliOptions } from './interfaces'
import { project } from './Project'
import { CURR_DIR } from './Project'
import { Shell } from './Shell'


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

    const isProjectCreated: boolean = project.createProjectDirectory(
        targetPath
    )
    if(!isProjectCreated)
        return

    project.createDirectoryContents(templatePath, projectName)

    const shell = new Shell(project)
    shell.runPostProcess(options.targetPath, options.projectName)
})