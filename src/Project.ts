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
        const templateFilesNames = this.getTemplateFilesNames(templatePath)

        templateFilesNames.forEach(filename => {
            if(this.fileShouldBeSkipped(filename)){
                this.skip()
            } else {
                const originFilePath = this.createFullPathName(templatePath, filename)
                const fileStats = this.getFileStats(originFilePath)
    
                
                const destinationFilePath = this.createFullPathName(
                    projectName,filename, CURRENT_DIR
                )
                if(this.isFile(fileStats)){
                    const templateData: TemplateData = { projectName }

                    const fileContent = this.readFileContent(originFilePath)
                    const fileContentWithTemplateData = this.insertTemplateData(fileContent, templateData)
                    
                    this.writeFileContent(destinationFilePath, fileContentWithTemplateData)
                } else if (this.isDirectory(fileStats)){
                    this.createDirectoryContents(originFilePath, destinationFilePath)
                }
            }
        })
    }
    private isDirectory = (fileStats: fs.Stats): boolean =>{
        return fileStats.isDirectory()
    }
    private isFile = (fileStats: fs.Stats): boolean =>{
        return fileStats.isFile()
    }
    private fileShouldBeSkipped = (file: string): boolean =>{
        return SKIP_FILES.includes(file)
    }
    private getTemplateFilesNames = (dirPath: string): string[] =>{
        return fs.readdirSync(dirPath)
    }
    
    public createFullPathName = (
            subdirPath: string, filename: string, rootDirPath?:string
        ): string =>{
            if(rootDirPath)
                return path.join(rootDirPath, subdirPath, filename)
            return path.join( subdirPath, filename)
     }
    
     private getFileStats = (filePath: string): fs.Stats =>{
        return fs.statSync(filePath)
     }
    
    private writeFileContent = (filePath: string, content: string): void =>{
        fs.writeFileSync(filePath, content, 'utf8')
    }
    
    
    private readFileContent = (filePath: string): string =>{
        return fs.readFileSync(filePath, 'utf8')
    }
    private skip = () =>{
        return
    }
    private insertTemplateData = (content: string, data: TemplateData): string =>{
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