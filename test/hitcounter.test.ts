import {Capture, Template} from '@aws-cdk/assertions';
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import {HitCounter} from "../lib/hitcounter";

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, 'MyTestConstruct', {
        downstream:  new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        })
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

test('Lambda exists and has env vars', () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'MyLambda', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'hello.handler'
        })
    });

    const template = Template.fromStack(stack);
    const envCapture = new Capture();
    template.resourceCountIs("AWS::Lambda::Function", 3);
    template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: envCapture
    });

    expect(envCapture.asObject()).toEqual(
        {
            Variables: {
                DOWNSTREAM_FUNCTION_NAME: {
                    Ref: "MyLambdaCCE802FB"
                },
                HITS_TABLE_NAME: {
                    Ref: "MyTestConstructHits24A357F0"
                }
            }
        }
    );
});

test('Dynamo RCU can be configured', () => {
    const stack = new cdk.Stack();

    expect(() => {
        new HitCounter(stack, 'MyConstruct', {
            downstream: new lambda.Function(stack, 'ALambda', {
                runtime: lambda.Runtime.NODEJS_14_X,
                code: lambda.Code.fromAsset('lambda'),
                handler: 'hello.handler'
            }),
            readCapacity: 6
        });
    }).toThrowError(/RCU in DynamoDB cannot be less than 1 or greater than 5/)

    expect(() => {
        new HitCounter(stack, 'MyConstruct2', {
            downstream: new lambda.Function(stack, 'ALambda2', {
                runtime: lambda.Runtime.NODEJS_14_X,
                code: lambda.Code.fromAsset('lambda'),
                handler: 'hello.handler'
            }),
            readCapacity: 0
        });
    }).toThrowError(/RCU in DynamoDB cannot be less than 1 or greater than 5/)
});
