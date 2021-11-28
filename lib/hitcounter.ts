import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import { TableViewer } from 'cdk-dynamo-table-viewer'
import {Table} from "@aws-cdk/aws-dynamodb";


export interface HitCounterProps {
    downstream: lambda.IFunction,
    readCapacity?: number
}

export class HitCounter extends cdk.Construct {
    public readonly handler: lambda.Function;
    public readonly myTableViewerUrl: cdk.CfnOutput;
    private tableViewer: TableViewer;

    constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
        super(scope, id);
        this.validateProps(props);

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: {name: 'path', type: dynamodb.AttributeType.STRING},
            readCapacity: props.readCapacity ?? 1,
            writeCapacity: 1
        });
        this.tableViewer = this.addTableViewer(this, table);

        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                HITS_TABLE_NAME: table.tableName,
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName
            }
        });

        table.grantReadWriteData(this.handler);
        props.downstream.grantInvoke(this.handler);

        this.myTableViewerUrl = new cdk.CfnOutput(this, 'TheViewerUrl', {
            value: this.tableViewer.endpoint
        });
    }

    private addTableViewer(scope: cdk.Construct, table: Table) {
        return new TableViewer(scope, 'MyTableViewer', {
            table: table,
            title: 'Hits Table'
        });
    }

    private validateProps(props: HitCounterProps) {
        if (props.readCapacity !== undefined && (props.readCapacity < 1 || props.readCapacity > 5)) {
            throw new Error("The RCU in DynamoDB cannot be less than 1 or greater than 5");
        }
    }
}
