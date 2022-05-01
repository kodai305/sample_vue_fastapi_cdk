#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from "../lib/pipelineStack";

const app = new cdk.App();
new PipelineStack(app, `CdkFrontStack`, {
  env: { account: '361854753178', region: 'ap-northeast-1' },
  stagingDeployConfig: {
    env: {
      region: "ap-northeast-1",
      account: '361854753178'
    },
    stackName: 'naonaapp-stg-infrastack',
    appConfig: {
      baseDomainName: 'staging.naona.cloud',
      certificateArn: 'arn:aws:acm:us-east-1:361854753178:certificate/7691d0ba-c676-41b4-b28a-633616de9567',
      appEnv: 'stg',
    },
  },
  productionDeployConfig: {
    env: {
      region: 'ap-northeast-1',
      account: '735205523900'
    },
    stackName: 'naonaapp-prd-infrastack',
    appConfig: {
      baseDomainName: 'naona.cloud',
      certificateArn: 'arn:aws:acm:us-east-1:735205523900:certificate/6f88d0b6-ed88-4e64-9184-186c9456bd38',
      appEnv: 'prd',
    },
  }  
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});