import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import { TableViewer } from 'cdk-dynamo-table-viewer'
import {Table} from "@aws-cdk/aws-dynamodb";


export interface HitCounterProps {
    downstream: lambda.IFunction
}

export class HitCounter extends cdk.Construct {
    public readonly handler: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: {name: 'path', type: dynamodb.AttributeType.STRING},
            readCapacity: 1,
            writeCapacity: 1
        });
        this.addTableViewer(this, table);

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
    }

    private addTableViewer(scope: cdk.Construct, table: Table) {
        const viewer = new TableViewer(scope, 'MyTableViewer', {
            table: table,
            title: 'Hits Table'
        });
    }
}
