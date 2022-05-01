// import * as chatbot from '@aws-cdk/aws-chatbot';
import { BuildEnvironmentVariableType } from "@aws-cdk/aws-codebuild";
import * as cdk from 'aws-cdk-lib';
import { AppConfig, CdkFrontStack } from "./frontendStack";
import { CodePipeline, ShellStep, CodePipelineSource } from "aws-cdk-lib/pipelines";
import { CodeCommitSourceAction, ManualApprovalAction } from "@aws-cdk/aws-codepipeline-actions";
import { SecretValue } from "@aws-cdk/core";
import { AppStage } from "./appStage";
import { Effect, PolicyStatement } from "@aws-cdk/aws-iam";
import { Construct } from 'constructs';


const app = new cdk.App();

export type AppDeployConfig  = {
  env: {
    account: string;
    region: string;
  },
  stackName?: string;
  appConfig: AppConfig
}

export interface PipelineStackProps extends cdk.StackProps {
  stagingDeployConfig: AppDeployConfig,
  productionDeployConfig: AppDeployConfig
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    if (!props) {
      throw new Error('props required');
    }
  
    const pipelineName = 'SampleFrontendPipeline';
    const pipeline = new CodePipeline(this, 'SampleFrontendPipeline', {
      pipelineName,
      crossAccountKeys: true,
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub('kodai305/sample_vue_fastapi_cdk', 'master', {
          authentication: cdk.SecretValue.secretsManager('github-token'),
        }),
        commands: [
          "cd frontend/app",
          "npm install",
          "npm run build",
          "cd ../../",
          "cd cdk-front",
          "npm ci",
          "npm run build",
          "npx cdk synth -v",
          "ls cdk.out"
        ],
        primaryOutputDirectory: 'cdk-front/cdk.out',
      }),
    });

    // ステージングへのデプロイ
    const staging = new AppStage(
      app, 'Staging', props.stagingDeployConfig
    );
    const stagingStage = pipeline.addStage(staging);

    /*
    // スモークテスト
    // TODO ここでは URL にアクセスできることしか確認してない
    // パフォーマンステストや正常系のパスなど自動化されていればこの辺に追加
    stagingStage.stackSteps addAction(new ShellStep("StgDeploy", {
      actionName: 'SmokeTest',
      useOutputs: {
        STAGING_APP_URL: pipeline.stackOutput(staging.appUrlOutput),
      },
      commands: [
        'curl -Ssf $STAGING_APP_URL',
      ],
    }));
    */

    // リリース承認
    //
    // 7 日以内に承認しないと自動で失敗扱いに
    // https://docs.aws.amazon.com/ja_jp/codepipeline/latest/userguide/approvals.html
    /*
    const releaseApprovalStage = pipeline.addStage('ReleaseApproval');
    const releaseApprovalAction = new ManualApprovalAction({
      actionName: 'ReleaseApproval',
    });
    releaseApprovalStage.addActions(releaseApprovalAction);
    */

    // プロダクションへのデプロイ
    //const production = new AppStage(
    //  app, 'Production', props.productionDeployConfig
    //);
    //const productionStage = pipeline.addStage(production);

    /*
    // スモークテスト
    // TODO ここでは URL にアクセスできることしか確認してない
    // パフォーマンステストや正常系のパスなど自動化されていればこの辺に追加
    productionStage.addActions(new ShellScriptAction({
      actionName: 'SmokeTest',
      useOutputs: {
        PRODUCTION_APP_URL: pipeline.stackOutput(production.appUrlOutput),
      },
      commands: [
        'curl -Ssf $PRODUCTION_APP_URL',
      ],
      runOrder: productionStage.nextSequentialRunOrder(1),
    }));

    // リリース完了処理でリポジトリにリリース課題の ID をタグとして設定したいので
    // そのためのポリシーを作る。
    //
    // 1. CodePipeline から承認アクションのコメント（リリース課題の ID を承認時に開発者が設定）
    //    を取ることができるようにパイプラインの実行ログとアクションログの参照権限をあたえるためのもの
    const policyStatementToReadApprovalComment = new PolicyStatement();
    policyStatementToReadApprovalComment.addActions(
      'codepipeline:ListPipelineExecutions',
      'codepipeline:ListActionExecutions',
    );
    policyStatementToReadApprovalComment.addResources(pipeline.codePipeline.pipelineArn);
    policyStatementToReadApprovalComment.effect = Effect.ALLOW;

    // 2. CodeCommit 上のリポジトリにタグ付けするためのもの
    const policyStatementToTagRepository = new PolicyStatement();
    policyStatementToTagRepository.addActions(
      'codecommit:GitPush',
    );
    policyStatementToTagRepository.addResources(repository.repositoryArn);
    policyStatementToTagRepository.effect = Effect.ALLOW;

    // 完了アクション
    const completeAction = new ShellScriptAction({
      actionName: 'Complete',
      additionalArtifacts: [
        sourceArtifact
      ],
      rolePolicyStatements: [
        policyStatementToReadApprovalComment,
        policyStatementToTagRepository,
      ],
      commands: [
        `PIPELINE_NAME=${pipelineName} ./scripts/tag_repository.sh`,
      ],
      runOrder: productionStage.nextSequentialRunOrder(1),
    });
    productionStage.addActions(completeAction);
    */

  //   // 通知チャンネル決めてないのでコメントアウト
  //   // // slack への通知設定
  //   // const slack = new chatbot.SlackChannelConfiguration(this, 'SlackChannel', {
  //   //   slackChannelConfigurationName: 'SampleAppChannel',
  //   //   // TODO
  //   //   // chatbot の XXX ワークスペース を指定。XXX ならそのままでよい
  //   //   slackWorkspaceId: '',
  //   //   // TODO
  //   //   // 送付先の public チャネルを指定。private でも可能だが `@aws` をチャネルに `\invite` する必要あり。
  //   //   slackChannelId: '',
  //   // });
  //   // pipeline.codePipeline.notifyOn('Notification', slack, {
  //   //   events: [
  //   //     // 失敗
  //   //     codepipeline.PipelineNotificationEvents.PIPELINE_EXECUTION_FAILED,
  //   //     // 開始
  //   //     codepipeline.PipelineNotificationEvents.PIPELINE_EXECUTION_STARTED,
  //   //     // 承認要求（ステージングに何らかの変更がデプロイされたことを示す。）
  //   //     codepipeline.PipelineNotificationEvents.MANUAL_APPROVAL_NEEDED,
  //   //     // 成功（プロダクションまでリリースされた。）
  //   //     codepipeline.PipelineNotificationEvents.PIPELINE_EXECUTION_SUCCEEDED,
  //   //   ],
  //   // });
  }
}