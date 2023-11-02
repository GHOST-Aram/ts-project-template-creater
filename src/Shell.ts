import { Project } from "./Project"
import * as shell from 'shelljs'
import fs from 'fs'
import chalk from "chalk"
import { ProcessVariables } from "./interfaces"

export class Shell {
    private project: Project

    constructor(project: Project){
        this.project = project
    }
    public getInstallationCommand = (projectPath: string): (string | false) => {
        if(this.isNpmPackage(projectPath))
            return 'npm install'
        if(this.isYarnPackage(projectPath)){
            return 'yarn add'
        }
    
        return false
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

    public installPackages = (command: string|false): boolean =>{
        let isWorkDone = false
        if(command){
            this.logProcess(`Running ${chalk.gray(command)} command`)
            
            const processResult = this.executeCommand(command)
            isWorkDone = this.isWorkDone(processResult)
        } else{
            return false
        }

        if(isWorkDone){
            this.logSuccess(
                'Process Complete.Packages installation Success'
            )
            return true
        } else{
            this.logMessage('Process Complete.No package installed')
            return false   
        }     
    }

    public changeDirectory = (path: string): void =>{
        shell.cd(path)
    }
    private isWorkDone = (processResult: shell.ShellString): boolean =>{
        return processResult.code == 0
    }
    private executeCommand = (command: string): shell.ShellString =>{
        return shell.exec(command)
    }
    private logProcess = (message: string) =>{
        console.log(chalk.blue(message)
        )
    }
    private logSuccess = (message: String) =>{
        console.log(chalk.green(message))
    }
    private logMessage = (message: string) =>{
        console.log(chalk.white(message))
    }
    public logWarning(message: string){
        console.log(chalk.yellow(message)
        )
    }

}