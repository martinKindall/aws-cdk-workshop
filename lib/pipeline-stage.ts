import {CdkWorkshopStack} from "./cdk_workshop-stack";
import {Stage, Construct, StageProps, CfnOutput} from '@aws-cdk/core'

export class MyPipelineStage extends Stage {
    public readonly myTableViewerUrl: CfnOutput;
    public readonly httpApiUrl: CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const webServiceStack = new CdkWorkshopStack(this, 'WebService');
        this.myTableViewerUrl = webServiceStack.myTableViewerUrl;
        this.httpApiUrl = webServiceStack.httpApiUrl;
    }
}
