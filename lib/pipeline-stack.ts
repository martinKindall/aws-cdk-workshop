import * as cdk from '@aws-cdk/core'
import * as codecommit from '@aws-cdk/aws-codecommit'
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "@aws-cdk/pipelines";
import {MyPipelineStage} from "./pipeline-stage";

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const repo = new codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: 'WorkshopRepo'
        });

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'MyCDKPipeline',
            synth: new CodeBuildStep('SynthStep', {
                input: CodePipelineSource.codeCommit(repo, 'main'),
                installCommands: [
                    'npm install -g aws-cdk'
                ],
                commands: [
                    'npm ci',
                    'npm run build',
                    'npx cdk synth'
                ]
            })
        });

        const workShopStage = new MyPipelineStage(this, 'DeployStage');
        const deployStage = pipeline.addStage(workShopStage);
        deployStage.addPost(
            new CodeBuildStep('TestViewerEndpoint', {
                projectName: 'TestViewerEndpoint',
                envFromCfnOutputs: {
                    ENDPOINT_URL: workShopStage.myTableViewerUrl
                },
                commands: [
                    'curl -Ssf $ENDPOINT_URL'
                ]
            }),

            new CodeBuildStep('TestApiGatewayEndpoint', {
                projectName: 'TestApiGatewayEndpoint',
                envFromCfnOutputs: {
                    ENDPOINT_URL: workShopStage.httpApiUrl
                },
                commands: [
                    'curl -Ssf $ENDPOINT_URL/hello',
                    'curl -Ssf $ENDPOINT_URL/dogs'
                ]
            })
        );
    }
}
