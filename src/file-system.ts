import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import * as ejs from 'ejs'
import { Answer, CliOptions, TemplateData } from './interfaces'
import * as shell from 'shelljs'

export const CURR_DIR = process.cwd()
const SKIP_FILES = ['node_modules', '.template.json']


export const createProjectDirectory = (projectPath: string): boolean =>{
    if(folderExists(projectPath)){
        logErrorMessage(
            `Folder ${projectPath} exists. Delete or use another name.`
        )
        return false
    } else {
        createDirectory(projectPath)
        return true
    } 

}

const createDirectory = (path: string) : void =>{
    fs.mkdirSync(path)
}
const folderExists = (path: string): boolean =>{
    return fs.existsSync(path)
}

const logErrorMessage = (message: string): void =>{
    console.error(chalk.red(message)
        )
}

export const createDirectoryContents = (
        templatePath: string, projectName: string
    ): void =>{
        const filesToCreate = readDirFiles(templatePath)

        filesToCreate.forEach(file => {
            const originFilePath = createAbsoluteFilePath(templatePath, file)
            const destinationFilePath = createAbsoluteFilePath(
                projectName,file, CURR_DIR
            )
            const fileDetails = getFileDetails(originFilePath)

            if(shouldBeSkipped(file))
                return
            if(isFile(fileDetails)){
                let fileContent = readFileContent(originFilePath)
                fileContent = getRenderedFileContent(fileContent, { projectName })

                pasteFileContent(destinationFilePath, fileContent)
            } else if (isDirectory(fileDetails)){
                createDirectoryContents(originFilePath, destinationFilePath)
            }
        })
}
const isDirectory = (fileDetails: fs.Stats): boolean =>{
    return fileDetails.isDirectory()
}
const isFile = (fileDetails: fs.Stats): boolean =>{
    return fileDetails.isFile()
}
const shouldBeSkipped = (file: string): boolean =>{
    return SKIP_FILES.includes(file)
}
 const readDirFiles = (dirPath: string): string[] =>{
    return fs.readdirSync(dirPath)
 }

 const createAbsoluteFilePath = (
        subdirPath: string, filename: string, rootDirPath?:string
    ): string =>{
        if(rootDirPath)
            return path.join(rootDirPath, subdirPath, filename)
        return path.join( subdirPath, filename)
 }

 const getFileDetails = (filePath: string): fs.Stats =>{
    return fs.statSync(filePath)
 }

const pasteFileContent = (filePath: string, content: string): void =>{
    fs.writeFileSync(filePath, content, 'utf8')
}


const readFileContent = (filePath: string): string =>{
    return fs.readFileSync(filePath, 'utf8')
}

const getRenderedFileContent = (content: string, data: TemplateData): string =>{
    return ejs.render(content, data)
}

export const runPostProcess = (options: CliOptions): boolean =>{
    const json_spec_file_path = createAbsoluteFilePath(
        options.targetPath, 'package.json'
    )
    const isNode = isNodeProject(json_spec_file_path)
    const installationCommand = getCommand(options.projectName)

    if(isNode && installationCommand){
        changeDirectory(options.targetPath)
        const installationResult = installModules(installationCommand)
        logProcess(installationCommand)
        if(!isInstallSuccess(installationResult)){
            console.log(
                chalk.yellow('Packages installation Failed')
            )
            return false
        }
    }
    console.log(chalk.green('Packages installation Success'))
    return true
}

const changeDirectory = (path: string): void =>{
    shell.cd(path)
}

const getCommand = (projectPath: string): (string | false) => {
    if(isNpmPackage(projectPath))
        return 'npm install'
    if(isYarnPackage(projectPath)){
        return 'yarn add'
    }

    return false
}
const isInstallSuccess = (installationResult: shell.ShellString): boolean =>{
    return installationResult.code == 0
}
const installModules = (command: string): shell.ShellString =>{
    return shell.exec(command)
}
const isNodeProject = (packageJsonFilePath: string):boolean => {
    return fs.existsSync(packageJsonFilePath)
}

const isNpmPackage = (projectPath: string): boolean =>{
    const jsonLockFilePath = createAbsoluteFilePath(
        projectPath, 'package-lock.json'
    )
    return fs.existsSync(jsonLockFilePath)
}

const isYarnPackage = (projectPath: string): boolean =>{
    const jsonLockFilePath = createAbsoluteFilePath(
        projectPath, 'yarn.lock'
    )
    return fs.existsSync(jsonLockFilePath)
}

const logProcess = (command: string): void =>{
    console.log(chalk.blue(
        `Installing node modules using ${command} command`)
    )
}

export const getCliOptions = (answers: Answer): CliOptions =>{
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