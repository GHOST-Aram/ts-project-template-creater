import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import * as ejs from 'ejs'
import * as interfaces from './interfaces'



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
                const fileInfo: interfaces.FileInformation = this.getFileInformation({
                    templatePath, 
                    projectName, 
                    filename
                })
                
                if(this.isFile(fileInfo.fileStats)){
                    const templateData: interfaces.TemplateData = { projectName }
                    const content: string = this.readFileContent(fileInfo.originPath)
                    const contentWithTemplateData: string = this.insertTemplateData(
                        content, templateData)  

                    this.writeFileContent(
                        fileInfo.destinationPath, contentWithTemplateData)

                } else if (this.isDirectory(fileInfo.fileStats)){
                    this.replicateTemplateDirectory(
                        fileInfo.originPath, fileInfo.destinationPath)
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
    private getFileInformation = (
            data: interfaces.FileInquiryData
        ): interfaces.FileInformation =>{

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
    private getFileStats = (filePath: string): fs.Stats =>{
        return fs.statSync(filePath)
    }
    
    private insertTemplateData = (
        content: string, data: interfaces.TemplateData
    ): string =>{
        const contentWithTemplateData = ejs.render(content, data)

        return contentWithTemplateData
    }
    private readFileContent = (originPath: string): string =>{
        return fs.readFileSync(originPath, 'utf8')
    } 
    private writeFileContent = (filePath: string, content: string): void =>{
        fs.writeFileSync(filePath, content, 'utf8')
    }
    private skip = () =>{
        return
    }
    
    public createFullPathName = (
            subdirPath: string, filename: string, rootDirPath?:string
        ): string =>{
            if(rootDirPath)
                return path.join(rootDirPath, subdirPath, filename)
            return path.join( subdirPath, filename)
    }
    
    public getCliOptions = (answers: interfaces.Answer): interfaces.CliOptions =>{
        const projectCHoice = answers['template']
        const projectName = answers['name']
        const templatePath = path.join(__dirname, 'templates', projectCHoice)
        const targetPath = path.join(this.CURRENT_DIRECTORY, projectName)
        
        const options: interfaces.CliOptions = {
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
