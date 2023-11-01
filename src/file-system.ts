import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import * as ejs from 'ejs'
import { Answer, CliOptions, TemplateData } from './interfaces'
import * as shell from 'shelljs'

export const CURR_DIR = process.cwd()
const SKIP_FILES = ['node_modules', '.template.json']

export class FileSystem{
    
    public createProjectDirectory = (projectPath: string): boolean =>{
        if(this.folderExists(projectPath)){
            this.logErrorMessage(
                `Folder ${projectPath} exists. Delete or use another name.`
            )
            return false
        } else {
            this.createDirectory(projectPath)
            return true
        } 
    
    }
    
    private createDirectory = (path: string) : void =>{
        fs.mkdirSync(path)
    }
    private folderExists = (path: string): boolean =>{
        return fs.existsSync(path)
    }
    
    private logErrorMessage = (message: string): void =>{
        console.error(chalk.red(message)
            )
    }
    
    public createDirectoryContents = (
            templatePath: string, projectName: string
        ): void =>{
            const filesToCreate = this.readDirFiles(templatePath)
    
            filesToCreate.forEach(file => {
                const originFilePath = this.createAbsoluteFilePath(templatePath, file)
                const destinationFilePath = this.createAbsoluteFilePath(
                    projectName,file, CURR_DIR
                )
                const fileDetails = this.getFileDetails(originFilePath)
    
                if(this.shouldBeSkipped(file))
                    return
                if(this.isFile(fileDetails)){
                    let fileContent = this.readFileContent(originFilePath)
                    fileContent = this.getRenderedFileContent(fileContent, { projectName })
    
                    this.pasteFileContent(destinationFilePath, fileContent)
                } else if (this.isDirectory(fileDetails)){
                    this.createDirectoryContents(originFilePath, destinationFilePath)
                }
            })
    }
    private isDirectory = (fileDetails: fs.Stats): boolean =>{
        return fileDetails.isDirectory()
    }
    private isFile = (fileDetails: fs.Stats): boolean =>{
        return fileDetails.isFile()
    }
    private shouldBeSkipped = (file: string): boolean =>{
        return SKIP_FILES.includes(file)
    }
     private readDirFiles = (dirPath: string): string[] =>{
        return fs.readdirSync(dirPath)
     }
    
     private createAbsoluteFilePath = (
            subdirPath: string, filename: string, rootDirPath?:string
        ): string =>{
            if(rootDirPath)
                return path.join(rootDirPath, subdirPath, filename)
            return path.join( subdirPath, filename)
     }
    
     private getFileDetails = (filePath: string): fs.Stats =>{
        return fs.statSync(filePath)
     }
    
    private pasteFileContent = (filePath: string, content: string): void =>{
        fs.writeFileSync(filePath, content, 'utf8')
    }
    
    
    private readFileContent = (filePath: string): string =>{
        return fs.readFileSync(filePath, 'utf8')
    }
    
    private getRenderedFileContent = (content: string, data: TemplateData): string =>{
        return ejs.render(content, data)
    }
    
    public runPostProcess = (options: CliOptions): boolean =>{
        const json_spec_file_path = this.createAbsoluteFilePath(
            options.targetPath, 'package.json'
        )
        const isNode = this.isNodeProject(json_spec_file_path)
        const installationCommand = this.getCommand(options.projectName)
    
        if(isNode && installationCommand){
            this.changeDirectory(options.targetPath)
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
        const jsonLockFilePath = this.createAbsoluteFilePath(
            projectPath, 'package-lock.json'
        )
        return fs.existsSync(jsonLockFilePath)
    }
    
    private isYarnPackage = (projectPath: string): boolean =>{
        const jsonLockFilePath = this.createAbsoluteFilePath(
            projectPath, 'yarn.lock'
        )
        return fs.existsSync(jsonLockFilePath)
    }
    
    private logProcess = (command: string): void =>{
        console.log(chalk.blue(
            `Installing node modules using ${command} command`)
        )
    }
    
    public getCliOptions = (answers: Answer): CliOptions =>{
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
    
        return options
    }
}

export const filSystem = new FileSystem()