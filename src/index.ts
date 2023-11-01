#! /usr/bin/env node
import { CliOptions } from './interfaces'
import { project } from './Project'
import { Shell } from './Shell'
import { QUESTIONS } from './constants'
import { cliInquirer } from './CLIInquirer'



cliInquirer.inquire(QUESTIONS).then(answers =>{

    const options: CliOptions = cliInquirer.getCLIOptions(answers)

    const isFilesCreated: boolean = project.createProjectDirectory(
        options.targetPath
    )
    if(!isFilesCreated){
        return
    } else {
        project.replicateTemplateDirectory(
            options.templatePath, 
            options.projectName
        )
    }
    

    const shell = new Shell(project)
    shell.runPostProcess(options.targetPath, options.projectName)
})