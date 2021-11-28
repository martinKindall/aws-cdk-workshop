import * as cdk from '@aws-cdk/core'
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "@aws-cdk/pipelines";
import {MyPipelineStage} from "./pipeline-stage";

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const githubOwnerRepo = 'martinKindall/aws-cdk-workshop';
        const bodeBuildSource = CodePipelineSource.connection(
            githubOwnerRepo,
            'main',
            {
                connectionArn: 'arn:aws:codestar-connections:us-east-1:371417955885:connection/7a804859-2d9e-43c0-b2ea-47ca243c60d9',
        })

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'MyCDKPipeline',
            synth: new CodeBuildStep('SynthStep', {
                input: bodeBuildSource,
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

        // const workShopStage = new MyPipelineStage(this, 'DeployStage');
        // const deployStage = pipeline.addStage(workShopStage);
        // deployStage.addPost(
        //     new CodeBuildStep('TestViewerEndpoint', {
        //         projectName: 'TestViewerEndpoint',
        //         envFromCfnOutputs: {
        //             ENDPOINT_URL: workShopStage.myTableViewerUrl
        //         },
        //         commands: [
        //             'curl -Ssf $ENDPOINT_URL'
        //         ]
        //     }),
        //
        //     new CodeBuildStep('TestApiGatewayEndpoint', {
        //         projectName: 'TestApiGatewayEndpoint',
        //         envFromCfnOutputs: {
        //             ENDPOINT_URL: workShopStage.httpApiUrl
        //         },
        //         commands: [
        //             'curl -Ssf $ENDPOINT_URL/hello',
        //             'curl -Ssf $ENDPOINT_URL/dogs'
        //         ]
        //     })
        // );
    }
}
