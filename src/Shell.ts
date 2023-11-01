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

    public runPostProcess = (processVars: ProcessVariables): boolean =>{
        this.changeDirectory(processVars.targetPath)
        
        if(this.isNodeProject(processVars.targetPath)){
            let isWorkDone = false
            if(processVars.command){
                const processResult = this.logProcessAndExecuteCommand(processVars.command)
                isWorkDone = this.isWorkDone(processResult)
            }

            if(!isWorkDone){
                console.log(chalk.green('Process Complete.Packages installation Success'))
                return true
            } else{
                console.log(chalk.white('Process Complete.No package installed'))
                return false   
            }
        } else {
            console.log(chalk.yellow(
                'Unknown Project Specification.Packages installation skipped')
            )
            return false
        }
    }

    private changeDirectory = (path: string): void =>{
        shell.cd(path)
    }
    
    public getCommand = (projectPath: string): (string | false) => {
        if(this.isNpmPackage(projectPath))
            return 'npm install'
        if(this.isYarnPackage(projectPath)){
            return 'yarn add'
        }
    
        return false
    }
    private isWorkDone = (processResult: shell.ShellString): boolean =>{
        console.log()
        return processResult.code == 0
    }
    private logProcessAndExecuteCommand = (command: string): shell.ShellString =>{
        console.log(chalk.blue(
            `Running ${chalk.gray(command)} command`)
        )
        return shell.exec(command)
    }
    private isNodeProject = (targetPath: string):boolean => {
        const config_file_path = this.project.createFullPathName(
            targetPath, 'package.json'
        )
        return fs.existsSync(config_file_path)
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