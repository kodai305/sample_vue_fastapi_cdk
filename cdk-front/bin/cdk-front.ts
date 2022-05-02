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
    stackName: 'sampleapp-stg-infrastack',
    appConfig: {
      baseDomainName: 'staging.mine.toggle-pf.com',
      hostedZoneId: 'Z0027987VXSPGRROHS3A',
      domainName: 'sampleapplication.staging.mine.toggle-pf.com',
      appEnv: 'stg',
    },
  },
  productionDeployConfig: {
    env: {
      region: 'ap-northeast-1',
      account: '716993826013'
    },
    stackName: 'sampleapp-prd-infrastack',
    appConfig: {
      baseDomainName: 'toggle-pf.com',
      hostedZoneId: 'Z0059839IPFJ7TFOFCQH',
      domainName: 'sampleapplication.mine.toggle-pf.com',
      appEnv: 'prd',
    },
  }  
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});