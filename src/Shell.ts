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
        shell.echo(chalk.blue(message)
        )
    }
    private logSuccess = (message: String) =>{
        shell.echo(chalk.green(message))
    }
    private logMessage = (message: string) =>{
        shell.echo(chalk.white(message))
    }
    public logWarning(message: string){
        shell.echo(chalk.yellow(message)
        )
    }

}