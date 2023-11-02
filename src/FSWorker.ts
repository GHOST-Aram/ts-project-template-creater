import fs from 'fs'
export class FileSystemWorker{
    public createDirectory = (path: string) : void =>{
        fs.mkdirSync(path)
    }
    public fileOrFolderExists = (path: string): boolean =>{
        return fs.existsSync(path)
    }
    public getFileStats = (filePath: string): fs.Stats =>{
        return fs.statSync(filePath)
    }
    public getTemplateFilesNames = (dirPath: string): string[] =>{
        return fs.readdirSync(dirPath)
    }
    public isDirectory = (fileStats: fs.Stats): boolean =>{
        return fileStats.isDirectory()
    }
    public isFile = (fileStats: fs.Stats): boolean =>{
        return fileStats.isFile()
    }
    public readFileContent = (originPath: string): string =>{
        return fs.readFileSync(originPath, 'utf8')
    } 
    public writeFileContent = (filePath: string, content: string): void =>{
        fs.writeFileSync(filePath, content, 'utf8')
    }
}