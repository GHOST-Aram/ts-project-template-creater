#! /usr/bin/env node
import { CliOptions, ProcessVariables } from './interfaces'
import { Project } from './Project'
import { Shell } from './Shell'
import { CURRENT_DIR, QUESTIONS, SKIP_FILES } from './config'
import { cliInquirer } from './CLIInquirer'



cliInquirer.inquire(QUESTIONS).then(answers =>{
    
    const options: CliOptions = cliInquirer.getCLIOptions(answers)
    
    const project = new Project(SKIP_FILES, CURRENT_DIR)
    const mkdirSuccess: boolean = project.createProjectDirectory(
        options.targetPath
    )
    if(mkdirSuccess){
        project.replicateTemplateDirectory(
            options.templatePath, 
            options.projectName
            )
        } else {
            return
    }
    

    const shell = new Shell(project)
    const command = shell.getCommand(options.projectName)
    const processVars: ProcessVariables = {
        targetPath: options.targetPath,
        command: command ? command : false
    }
    shell.runPostProcess(processVars)
}).catch(error => console.log(
    'Message: ', error.message,
))