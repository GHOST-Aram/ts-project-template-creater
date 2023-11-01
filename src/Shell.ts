import { Project, project } from "./Project"
import chalk from "chalk"
export class Shell{
    private project: Project
    constructor(project: Project){
        this.project = project
    }
    public runPostProcess = (targetPath: string, projectName: string): boolean =>{
        const json_spec_file_path = this.project.createAbsoluteFilePath(
            targetPath, 'package.json'
        )
        const isNode = this.project.isNodeProject(json_spec_file_path)
        const installationCommand = this.project.getCommand(projectName)
    
        if(isNode && installationCommand){
            this.project.changeDirectory(targetPath)
            const installationResult = this.project.installModules(installationCommand)

            this.logProcess(installationCommand)
            if(!this.project.isInstallSuccess(installationResult)){
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
}