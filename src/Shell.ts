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
        const json_spec_file_path = this.project.createFullPathName(
            targetPath, 'package.json'
        )
        const isNode = this.isNodeProject(json_spec_file_path)
        const installationCommand = this.getCommand(projectName)
    
        if(isNode && installationCommand){
            this.changeDirectory(targetPath)
            const installationResult = this.installModules(installationCommand)

            this.logProcess(installationCommand)
            if(!this.isInstallSuccess(installationResult)){
                console.log(
                    chalk.yellow('Packages installation Failed')
                )
                return false
            }
        }
        console.log(chalk.green('Packages installation Success'))
        return true
    }

    private logProcess = (command: string): void =>{
        console.log(chalk.blue(
            `Installing node modules using ${command} command`)
        )
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
    private isInstallSuccess = (installationResult: shell.ShellString): boolean =>{
        return installationResult.code == 0
    }
    private installModules = (command: string): shell.ShellString =>{
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