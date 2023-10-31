import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import * as ejs from 'ejs'
import { Answer, CliOptions, TemplateData } from './interfaces'
import * as shell from 'shelljs'

export const CURR_DIR = process.cwd()
const SKIP_FILES = ['node_modules', '.template.json']


export const createProject = (projectPath: string) =>{
    if(fs.existsSync(projectPath)){
        console.error(chalk.red('Folder ', projectPath, 
            + ' exists. Delete or use another name.')
        )

        return false
    } 
     fs.mkdirSync(projectPath)
     return true
}

export const createDirectoryContents = (
    templatePath: string, projectName: string) =>{
        const filesToCreate = readDirFiles(templatePath)

        filesToCreate.forEach(file => {
            const originFilePath = createAbsoluteFilePath(templatePath, file)
            const destinationFilePath = createAbsoluteFilePath(
                projectName,file, CURR_DIR
            )
            const fileDetails = getFileDetails(originFilePath)

            if(SKIP_FILES.includes(file))
                return
            if(fileDetails.isFile()){
                let fileContent = readFileContent(originFilePath)
                fileContent = render(fileContent, { projectName })

                pasteFileContent(destinationFilePath, fileContent)
            } else if (fileDetails.isDirectory()){
                createDirectoryContents(originFilePath, destinationFilePath)
            }
        })
}
 const readDirFiles = (dirPath: string) =>{
    return fs.readdirSync(dirPath)
 }

 const createAbsoluteFilePath = (
        subdirPath: string, filename: string, rootDirPath?:string
    ) =>{
        if(rootDirPath)
            return path.join(rootDirPath, subdirPath, filename)
        return path.join( subdirPath, filename)
 }

 const getFileDetails = (filePath: string) =>{
    return fs.statSync(filePath)
 }

const pasteFileContent = (filePath: string, content: string) =>{
    fs.writeFileSync(filePath, content, 'utf8')
}


const readFileContent = (filePath: string) =>{
    return fs.readFileSync(filePath, 'utf8')
}

const render = (content: string, data: TemplateData) =>{
    return ejs.render(content, data)
}

export const runPostProcess = (options: CliOptions) =>{
    const json_spec_file_path = createAbsoluteFilePath(
        options.targetPath, 'package.json'
    )
    const isNode = isNodeProject(json_spec_file_path)
    const installationCommand = getCommand(options.projectName)

    if(isNode && installationCommand){
        const projectRootDir = options.targetPath
        changeDirectory(projectRootDir)
        const installationResult = installModules(installationCommand)
        logProcess(installationCommand)
        if(installationResult.code !== 0){
            console.log(
                chalk.yellow('Packages installation Failed')
            )
            return false
        }
    }
    console.log(chalk.green('Packages installation Success'))
    return true
}

const changeDirectory = (path: string) =>{
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
const installModules = (command: string) =>{
    return shell.exec(command)
}
const isNodeProject = (packageJsonFilePath: string) => {
    return fs.existsSync(packageJsonFilePath)
}

const isNpmPackage = (projectPath: string) =>{
    const jsonLockFilePath = createAbsoluteFilePath(
        projectPath, 'package-lock.json'
    )
    return fs.existsSync(jsonLockFilePath)
}

const isYarnPackage = (projectPath: string) =>{
    const jsonLockFilePath = createAbsoluteFilePath(
        projectPath, 'yarn.lock'
    )
    return fs.existsSync(jsonLockFilePath)
}

const logProcess = (command: string) =>{
    console.log(chalk.blue(
        `Installing node modules using ${command} command`)
    )
}

export const getCliOptions = (answers: Answer) =>{
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