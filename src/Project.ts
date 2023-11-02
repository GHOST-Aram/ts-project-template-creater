import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import * as ejs from 'ejs'
import { Answer, CliOptions, FileInformation, FileInquiryData, TemplateData } from './interfaces'



export class Project{
    private  FILES_TO_SKIP: string[]
    private CURRENT_DIRECTORY: string

    constructor(filesToSkip: string[], currentDirectory: string){
        this.CURRENT_DIRECTORY = currentDirectory
        this.FILES_TO_SKIP = filesToSkip
    }
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
    
    public replicateTemplateDirectory = (
            templatePath: string, projectName: string
        ): void =>{
        const templateFilesNames: string[] = this.getTemplateFilesNames(templatePath)

        templateFilesNames.forEach(filename => {
            if(this.fileShouldBeSkipped(filename)){
                this.skip()
            } else {
                const inquiryData: FileInquiryData =  {
                    templatePath, 
                    projectName, 
                    filename
                }
                const fileInfo: FileInformation = this.getFileInformation(
                    inquiryData
                )
                
                if(this.isFile(fileInfo.fileStats)){
                    const templateData: TemplateData = { projectName }

                    const fileContentWithTemplateData = this.readFileAndInsertTemplateData(
                        fileInfo.originPath, templateData
                    )  
                    this.writeFileContent(fileInfo.destinationPath, fileContentWithTemplateData)

                } else if (this.isDirectory(fileInfo.fileStats)){
                    this.replicateTemplateDirectory(fileInfo.originPath, fileInfo.destinationPath)
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
        return this.FILES_TO_SKIP.includes(file)
    }
    private getFileInformation = (data: FileInquiryData): FileInformation =>{
        const originFilePath = this.createFullPathName(
            data.templatePath, data.filename
        )
        const fileStats = this.getFileStats(originFilePath)

        
        const destinationFilePath = this.createFullPathName(
            data.projectName,data.filename, this.CURRENT_DIRECTORY
        )

        return ({
            originPath: originFilePath,
            fileStats,
            destinationPath: destinationFilePath
        })
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
    
    
    private skip = () =>{
        return
    }
    private readFileAndInsertTemplateData = (
        originPath: string, data: TemplateData
    ): string =>{
        const content = fs.readFileSync(originPath, 'utf8')
        const contentWithTemplateData = ejs.render(content, data)

        return contentWithTemplateData
    }
     
    public getCliOptions = (answers: Answer): CliOptions =>{
        const projectCHoice = answers['template']
        const projectName = answers['name']
        const templatePath = path.join(__dirname, 'templates', projectCHoice)
        const targetPath = path.join(this.CURRENT_DIRECTORY, projectName)
        
        const options: CliOptions = {
            projectName,
            templateName: projectCHoice,
            templatePath,
            targetPath
        }
    
        return options
    }
    public isNodeProject = (targetPath: string):boolean => {
        const config_file_path = this.createFullPathName(
            targetPath, 'package.json'
        )
        return fs.existsSync(config_file_path)
    }
}
