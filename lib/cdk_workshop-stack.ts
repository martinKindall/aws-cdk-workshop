import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigw from '@aws-cdk/aws-apigatewayv2'
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations'
import {HitCounter} from "./hitcounter";

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler'
    });

    const helloHitCounter = new HitCounter(this, 'MyHitCounter', {downstream: hello});

    const lambdaIntegration = new LambdaProxyIntegration({
      handler: helloHitCounter.handler
    })

    const httpApi = new apigw.HttpApi(this, 'MyHttpApi');
    const paths = ['/hello', '/dogs'];
    paths.forEach(path => {
      httpApi.addRoutes({
        path: path,
        methods: [apigw.HttpMethod.GET, apigw.HttpMethod.POST],
        integration: lambdaIntegration
      });
    });
  }
}
