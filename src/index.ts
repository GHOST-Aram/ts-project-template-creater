#! /usr/bin/env node
import { CliOptions } from './interfaces'
import { Project } from './Project'
import { Shell } from './Shell'
import * as configs from './config'
import { cliInquirer } from './CLIInquirer'



cliInquirer.inquire(configs.QUESTIONS).then(answers =>{
    
    const options: CliOptions = cliInquirer.createCLIOptions(answers)
    
    const project = new Project(configs.SKIP_FILES, configs.CURRENT_DIR)
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
    
    if(project.isNodeProject(options.targetPath)){
        const command = project.selectInstallationCommand(options.projectName)
        
        shell.changeDirectory(options.targetPath)
        shell.installPackages(command)
    } else {
        shell.logWarning(
            'Unknown Project Specification.Packages installation skipped'
        )
    }

    return
}).catch(error => console.log(
    'Message: ', error.message,
))