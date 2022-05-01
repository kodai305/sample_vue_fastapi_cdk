import { CfnOutput, Stage, StageProps } from "aws-cdk-lib";
import { AppConfig, CdkFrontStack } from "./frontendStack";
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
// const app = new cdk.App();

export interface AppStageProps extends StageProps {
  appConfig: AppConfig
}

export class AppStage extends Stage {
  public readonly appUrlOutput: CfnOutput;
  
  constructor(scope: Construct, id: string, props: AppStageProps) {
    super(scope, id, props);
    const frontApp = new CdkFrontStack(this, `sample-${props.appConfig.appEnv}-infrastack`, props);
    // this.appUrlOutput = app.appUrlOutput;
  }
}
