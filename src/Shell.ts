import { Project } from "./Project"
import * as shell from 'shelljs'
import fs from 'fs'
import chalk from "chalk"

export class Shell{
    private project: Project
    constructor(project: Project){
        this.project = project
    }
    public runPostProcess = (targetPath: string, projectName: string): boolean =>{
        this.changeDirectory(targetPath)
        const config_file_path = this.project.createFullPathName(
            targetPath, 'package.json'
        )
        const isNode = this.isNodeProject(config_file_path)
        const command = this.getCommand(projectName)
    
        if(isNode && command){
            const processResult = this.logProcessAndExecuteCommand(
                command
            )

            if(!this.isInstallSuccess(processResult)){
                console.log(
                    chalk.yellow('Packages installation Failed')
                )
                return false
            }
        }
        console.log(chalk.green('Packages installation Success'))
        return true
    }

    private changeDirectory = (path: string): void =>{
        shell.cd(path)
    }
    
    private getCommand = (projectPath: string): (string | false) => {
        if(this.isNpmPackage(projectPath))
            return 'npm install'
        if(this.isYarnPackage(projectPath)){
            return 'yarn add'
        }
    
        return false
    }
    private isInstallSuccess = (processResult: shell.ShellString): boolean =>{
        console.log()
        return processResult.code == 0
    }
    private logProcessAndExecuteCommand = (command: string): shell.ShellString =>{
        console.log(chalk.blue(
            `Installing node modules using ${command} command`)
        )
        return shell.exec(command)
    }
    private isNodeProject = (packageJsonFilePath: string):boolean => {
        return fs.existsSync(packageJsonFilePath)
    }

    private isNpmPackage = (projectPath: string): boolean =>{
        const jsonLockFilePath = this.project.createFullPathName(
            projectPath, 'package-lock.json'
        )
        return fs.existsSync(jsonLockFilePath)
    }
    
    private isYarnPackage = (projectPath: string): boolean =>{
        const jsonLockFilePath = this.project.createFullPathName(
            projectPath, 'yarn.lock'
        )
        return fs.existsSync(jsonLockFilePath)
    }
}