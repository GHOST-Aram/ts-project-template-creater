import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import * as ejs from 'ejs'
import { Answer, CliOptions, TemplateData } from './interfaces'
import { SKIP_FILES, CURRENT_DIR } from './constants'



export class Project{
    
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
        console.error(chalk.red(message))
    }
    
    public createDirectoryContents = (
            templatePath: string, projectName: string
        ): void =>{
        const templateFiles = this.getTemplateFiles(templatePath)

        templateFiles.forEach(file => {
            if(this.fileShouldBeSkipped(file)){
                this.skip()
            } else {
                const originFilePath = this.createAbsoluteFilePath(templatePath, file)
                const fileDetails = this.getFileDetails(originFilePath)
    
                const destinationFilePath = this.createAbsoluteFilePath(
                    projectName,file, CURRENT_DIR
                    )
    
                if(this.isFile(fileDetails)){
                    let fileContent = this.readFileContent(originFilePath)
                    fileContent = this.renderTemplateData(fileContent, { projectName })
    
                    this.pasteFileContent(destinationFilePath, fileContent)
                } else if (this.isDirectory(fileDetails)){
                    this.createDirectoryContents(originFilePath, destinationFilePath)
                }
            }
        })
    }
    private isDirectory = (fileDetails: fs.Stats): boolean =>{
        return fileDetails.isDirectory()
    }
    private isFile = (fileDetails: fs.Stats): boolean =>{
        return fileDetails.isFile()
    }
    private fileShouldBeSkipped = (file: string): boolean =>{
        return SKIP_FILES.includes(file)
    }
    private getTemplateFiles = (dirPath: string): string[] =>{
        return fs.readdirSync(dirPath)
    }
    
    public createAbsoluteFilePath = (
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
    private skip = () =>{
        return
    }
    private renderTemplateData = (content: string, data: TemplateData): string =>{
        return ejs.render(content, data)
    }
     
    public getCliOptions = (answers: Answer): CliOptions =>{
        const projectCHoice = answers['template']
        const projectName = answers['name']
        const templatePath = path.join(__dirname, 'templates', projectCHoice)
        const targetPath = path.join(CURRENT_DIR, projectName)
        
        const options: CliOptions = {
            projectName,
            templateName: projectCHoice,
            templatePath,
            targetPath
        }
    
        return options
    }
}

export const project = new Project()